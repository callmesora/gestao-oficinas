# Source from the application root in bash/zsh: source setup/Enter-Prerequisites.sh
# Resolve from the current project, without machine-specific paths or global settings.
if [ ! -f setup/LOCAL-WORKSPACE.md ] || [ ! -x .venv/bin/python ]; then
  printf '%s\n' 'Run from the application root with its .venv installed.' >&2
  return 1
fi
export VIRTUAL_ENV="$PWD/.venv"
if [ -x "$PWD/analysis-local/toolchain/node_modules/node/bin/node" ]; then
  export PATH="$PWD/analysis-local/toolchain/node_modules/node/bin:$PWD/analysis-local/toolchain/node_modules/.bin:$PATH"
fi
export PATH="$VIRTUAL_ENV/bin:$PATH"
export PYTHON="$VIRTUAL_ENV/bin/python"
export PYTHONUTF8=1
export PYTHONIOENCODING=utf-8
printf '%s\n' "Python: $PYTHON" 'Local migration prerequisites loaded.'
