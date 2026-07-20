from pyodide.code import eval_code_async as _repl_eval_code_async
import traceback as _repl_traceback
_repl_last_error = None
async def _repl_execute(_src):
    global _repl_last_error
    _repl_last_error = None
    try:
        await _repl_eval_code_async(_src, globals=globals())
    except Exception as _repl_exc:
        _repl_tb = _repl_exc.__traceback__
        _repl_last_error = {
            "ename": type(_repl_exc).__name__,
            "evalue": str(_repl_exc),
            "traceback": "".join(
                _repl_traceback.format_exception(
                    type(_repl_exc), _repl_exc, _repl_tb.tb_next if _repl_tb else None
                )
            ),
        }
