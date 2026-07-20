# Runs user code in the REPL's persistent globals (not a fresh namespace), so variables and imports
# from earlier runs are still visible — that's the whole point of a REPL versus a one-shot script.
# eval_code_async is Pyodide's own top-level-await-capable exec, which is why `await` works directly
# in REPL code without the user wrapping it in an async function themselves.
#
# On failure, records a Jupyter/nbformat-shaped error (ename/evalue/traceback) in _repl_last_error
# instead of letting the exception propagate — PyodideReplSession.execute() reads this afterwards.
# The traceback is built from `_repl_traceback_frame.tb_next`, deliberately skipping this function's
# own stack frame, so what the user sees starts at their code, not at "_repl_execute" internals.
from pyodide.code import eval_code_async as _repl_eval_code_async
import traceback as _repl_traceback
_repl_last_error = None
async def _repl_execute(_repl_source):
    global _repl_last_error
    _repl_last_error = None
    try:
        await _repl_eval_code_async(_repl_source, globals=globals())
    except Exception as _repl_exception:
        _repl_traceback_frame = _repl_exception.__traceback__
        _repl_last_error = {
            "ename": type(_repl_exception).__name__,
            "evalue": str(_repl_exception),
            "traceback": "".join(
                _repl_traceback.format_exception(
                    type(_repl_exception),
                    _repl_exception,
                    _repl_traceback_frame.tb_next if _repl_traceback_frame else None,
                )
            ),
        }
