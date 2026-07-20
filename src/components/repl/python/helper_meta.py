import inspect as _inspect, json as _json
from mat3ra.made.tools import helpers as _repl_helpers_mod
_repl_helper_meta = []
for _repl_name in getattr(_repl_helpers_mod, "__all__", []):
    _repl_obj = getattr(_repl_helpers_mod, _repl_name, None)
    if not callable(_repl_obj):
        continue
    try:
        _repl_sig = str(_inspect.signature(_repl_obj))
    except (ValueError, TypeError):
        _repl_sig = "(...)"
    _repl_doc = (_inspect.getdoc(_repl_obj) or "").strip().split("\n")[0]
    _repl_helper_meta.append(
        {"name": _repl_name, "signature": _repl_sig, "doc": _repl_doc,
         "module": getattr(_repl_obj, "__module__", "")}
    )
_repl_helper_meta_json = _json.dumps(_repl_helper_meta)
