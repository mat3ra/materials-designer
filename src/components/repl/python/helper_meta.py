# Introspects the helper API once at startup so the editor can offer categorized autocomplete that
# always matches the actually-installed mat3ra.made version (no hand-maintained list to drift out of
# sync). One record per callable in helpers.__all__, read by MaterialsReplSession and surfaced as
# ReplHelperMeta on the JS side. Underscore-prefixed locals keep all of this out of the Material
# collection in collect.py (which only looks at non-underscore globals).
import inspect as _repl_inspect, json as _repl_json
from mat3ra.made.tools import helpers as _repl_helpers_module
_repl_helper_meta = []
for _repl_helper_name in getattr(_repl_helpers_module, "__all__", []):
    _repl_helper_object = getattr(_repl_helpers_module, _repl_helper_name, None)
    if not callable(_repl_helper_object):
        continue
    try:
        _repl_signature = str(_repl_inspect.signature(_repl_helper_object))
    except (ValueError, TypeError):
        _repl_signature = "(...)"
    # Only the first line of the docstring: the full text (Args/Returns) is fetched on demand via
    # describe() in completer.py when the user actually highlights this completion.
    _repl_docstring = (_repl_inspect.getdoc(_repl_helper_object) or "").strip().split("\n")[0]
    _repl_helper_meta.append(
        {
            "name": _repl_helper_name,
            "signature": _repl_signature,
            "doc": _repl_docstring,
            "module": getattr(_repl_helper_object, "__module__", ""),
        }
    )
_repl_helper_meta_json = _repl_json.dumps(_repl_helper_meta)
