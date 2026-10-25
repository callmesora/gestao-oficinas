#!/usr/bin/env python3
"""Explicit CI/test prerequisite; never called by local application startup.

Requires Apple command-line tools on macOS. Windows requires Visual Studio C++/SDK,
native Strawberry Perl, and `python -m pip install meson==1.10.0 ninja==1.13.0`.
Build procedure: https://www.postgresql.org/docs/18/install-meson.html and
https://www.postgresql.org/docs/18/installation-platform-notes.html
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import platform
import shutil
import subprocess
import sys
import tarfile
import tempfile
import urllib.request
import zipfile

VERSION = "18.4"
SOURCE = "https://ftp.postgresql.org/pub/source/v18.4/postgresql-18.4.tar.bz2"
# Published at SOURCE + '.sha256'; verified again before extracting.
SOURCE_SHA = "81a81ec695fb0c7901407defaa1d2f7973617154cf27ba74e3a7ab8e64436094"
FLEX = "https://github.com/lexxmark/winflexbison/releases/download/v2.5.25/win_flex_bison-2.5.25.zip"
# Published Microsoft package manifest for the upstream artifact:
# https://github.com/microsoft/winget-pkgs/blob/master/manifests/w/WinFlexBison/win_flex_bison/2.5.25/WinFlexBison.win_flex_bison.installer.yaml
FLEX_SHA = "8d324b62be33604b2c45ad1dd34ab93d722534448f55a16ca7292de32b6ac135"
ROOT = Path(__file__).resolve().parent.parent


def download(url, destination, maximum):
    size = 0
    with urllib.request.urlopen(url, timeout=60) as response, destination.open("xb") as output:
        while chunk := response.read(1024 * 1024):
            size += len(chunk)
            if size > maximum:
                raise RuntimeError("Prerequisite download exceeds its fixed size bound")
            output.write(chunk)


def sha(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def run(arguments, cwd, environment=None, capture=False):
    print("Prerequisite:", arguments, flush=True)
    return subprocess.run(arguments, cwd=cwd, env=environment, check=True, timeout=1200,
                          stdout=subprocess.PIPE if capture else None,
                          stderr=subprocess.PIPE if capture else None, text=True).stdout


def windows_clients(source, build, prefix, work):
    meson = [sys.executable, "-m", "mesonbuild.mesonmain"]
    if run(meson + ["--version"], work, capture=True).strip() != "1.10.0":
        raise RuntimeError("Install the documented meson==1.10.0 prerequisite")
    # PostgreSQL18.4 meson.build:336-339 requires native Perl, Flex and Bison,
    # including for this official release tarball, before selecting client targets.
    perl = run(["perl", "-V:archname"], work, capture=True)
    if "MSWin32" not in perl:
        raise RuntimeError("Native Strawberry Perl required; MSYS/Cygwin Perl is unsupported")
    archive = work / "win-flex-bison.zip"
    download(FLEX, archive, 2 * 1024 ** 2)
    if sha(archive) != FLEX_SHA:
        raise RuntimeError("Windows Flex/Bison checksum mismatch")
    # Keep every upstream README/skeleton notice in the exact checked archive.
    shutil.copy2(archive, prefix / "notices" / "win-flex-bison-2.5.25.zip")
    generators = work / "win-flex-bison"
    with zipfile.ZipFile(archive) as files:
        if len(files.infolist()) > 1000 or sum(entry.file_size for entry in files.infolist()) > 20 * 1024 ** 2:
            raise RuntimeError("Windows Flex/Bison archive exceeds its fixed bounds")
        for entry in files.infolist():
            if not (generators / entry.filename).resolve().is_relative_to(generators):
                raise RuntimeError("Unsafe Windows Flex/Bison archive member")
        files.extractall(generators)
    environment = {**os.environ, "CC": "cl", "CXX": "cl"}
    run(meson + ["setup", str(build), str(source), "--vsenv", "--backend=ninja", "--buildtype=release",
                 f"--prefix={prefix}", "--auto-features=disabled", "-Dssl=none",
                 f"-DFLEX={generators / 'win_flex.exe'}", f"-DBISON={generators / 'win_bison.exe'}"], work, environment)
    run(meson + ["compile", "-C", str(build), "-j", "4", "pg_dump", "pg_restore"], work, environment)
    targets = json.loads(run(meson + ["introspect", "--targets", str(build)], work, environment, capture=True))
    # Copy only these built clients and their own libpq DLL; no server/global install.
    for name, kind, extension in [("pg_dump", "executable", ".exe"), ("pg_restore", "executable", ".exe"), ("libpq", "shared library", ".dll")]:
        candidates = [Path(file).resolve() for target in targets if target["name"] == name and target["type"] == kind
                      for file in target["filename"] if file.endswith(extension)]
        if len(candidates) != 1 or not candidates[0].is_relative_to(build):
            raise RuntimeError("Expected PostgreSQL client build target absent")
        shutil.copy2(candidates[0], prefix / "bin" / (name + extension))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--directory", required=True, help="Fresh installation directory inside this checkout's analysis-local")
    parser.add_argument("--github-env", action="store_true", help="Publish the validated canonical bin to GitHub Actions")
    args = parser.parse_args()
    if sys.platform not in ("darwin", "win32") or sys.platform == "win32" and platform.machine().lower() not in ("amd64", "x86_64"):
        raise RuntimeError("Only native macOS and Windows x64 test hosts are supported")
    ignored = (ROOT / "analysis-local").resolve()
    prefix = Path(args.directory).resolve()
    if prefix == ignored or not prefix.is_relative_to(ignored) or prefix.exists():
        raise RuntimeError("A fresh ignored installation directory is required; existing tools are never replaced")
    if args.github_env and not os.environ.get("GITHUB_ENV"):
        raise RuntimeError("--github-env requires the GitHub Actions environment file")
    prefix.parent.mkdir(parents=True, exist_ok=True)
    prefix.mkdir(mode=0o700)
    complete = False
    try:
        with tempfile.TemporaryDirectory(prefix="backup-clients-build-", dir=prefix.parent) as temporary:
            work = Path(temporary).resolve()
            published = work / "source.sha256"
            download(SOURCE + ".sha256", published, 1024)
            if published.read_text().split() != [SOURCE_SHA, "postgresql-18.4.tar.bz2"]:
                raise RuntimeError("Published PostgreSQL checksum differs from the pinned release")
            archive = work / "postgresql.tar.bz2"
            download(SOURCE, archive, 32 * 1024 ** 2)
            if sha(archive) != SOURCE_SHA:
                raise RuntimeError("PostgreSQL source checksum mismatch")
            with tarfile.open(archive) as files:
                members = files.getmembers()
                if len(members) > 30000 or sum(entry.size for entry in members) > 512 * 1024 ** 2:
                    raise RuntimeError("PostgreSQL source archive exceeds its fixed bounds")
                files.extractall(work, filter="data")
            source = work / "postgresql-18.4"
            (prefix / "notices").mkdir(mode=0o700)
            shutil.copy2(source / "COPYRIGHT", prefix / "notices" / "PostgreSQL-COPYRIGHT")
            (prefix / "bin").mkdir(mode=0o700)
            if sys.platform == "darwin":
                configuration = [f"--prefix={prefix}", "--without-icu", "--without-readline", "--without-zlib",
                                 "--without-lz4", "--without-zstd", "--without-gssapi", "--without-ldap"]
                run([str(source / "configure"), *configuration], source)
                run(["make", "-C", "src/backend", "generated-headers"], source)
                # Partial recursive builds share generated port headers; serialize a fresh tree.
                run(["make", "-C", "src/bin/pg_dump"], source)
                run(["make", "-C", "src/interfaces/libpq", "install"], source)
                run(["make", "-C", "src/bin/pg_dump", "install"], source)
            else:
                windows_clients(source, work / "build", prefix, work)
        tools = {}
        for name in ("pg_dump", "pg_restore"):
            executable = prefix / "bin" / (name + (".exe" if sys.platform == "win32" else ""))
            version = run([str(executable), "--version"], prefix, capture=True).strip()
            if version != f"{name} (PostgreSQL) {VERSION}":
                raise RuntimeError("Built PostgreSQL client version mismatch")
            tools[name] = {"version": version, "sha256": sha(executable)}
        (prefix / "provisioning.json").write_text(json.dumps({"postgresVersion": VERSION, "source": SOURCE,
            "sourceSha256": SOURCE_SHA, "host": platform.platform(), "tools": tools}, indent=2), encoding="utf-8")
        canonical = str((prefix / "bin").resolve(strict=True))
        if "\n" in canonical or "\r" in canonical:
            raise RuntimeError("Invalid environment path")
        if args.github_env:
            with open(os.environ["GITHUB_ENV"], "a", encoding="utf-8") as environment:
                environment.write(f"WORKSHOP_TEST_BACKUP_TOOLS={canonical}\n")
        complete = True
        print(json.dumps({"WORKSHOP_TEST_BACKUP_TOOLS": canonical, "tools": tools}))
    finally:
        if not complete:
            shutil.rmtree(prefix)


if __name__ == "__main__":
    main()
