// Fixed owned-file scenario compiled only into the separate development probe.
(async () => {
  const invoke = window.__TAURI_INTERNALS__.invoke;
  const identity = { terminalCode: "NATIVE-PROBE", sourceFolder: "C:\\Scanner", sourceFilename: "scan.txt" };
  const read = request => invoke("read_terminal_scanner_file", { request });
  const expected = "A;1.500\r\n€;2\r\n";
  try {
    if ((await read(identity)).text !== expected) throw new Error("exact");
    if ((await read(identity)).text !== expected) throw new Error("repeat");
    const refused = async (request, code) => { try { await read(request); return false; } catch (error) { return error === code; } };
    if (!await refused({ ...identity, sourceFilename: "other.txt" }, "scanner_file_unavailable")) throw new Error("identity");
    if (!await refused({ ...identity, terminalCode: "INVALID-PROBE", sourceFilename: "invalid.txt" }, "scanner_file_encoding")) throw new Error("encoding");
    const [info, args] = await Promise.all([invoke("native_info"), invoke("read_startup_arguments")]);
    await invoke("plugin:event|emit", { event: "native-probe-result", payload: { info, arguments: args, scanner: { exact: true, repeatable: true, unavailable: true, invalidEncoding: true } } });
    await invoke("terminate_application");
  } catch { await invoke("plugin:event|emit", { event: "native-probe-failure", payload: "scanner" }); }
})();
