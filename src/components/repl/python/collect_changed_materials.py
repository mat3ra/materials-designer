# Materials the run created or rebound (identity differs from the snapshot). Skips `_` names, which is
# all of our own plumbing, and the reserved inputs — inject_materials.py rebinds those every run, so
# without the exclusion the designer's own list would be appended back into itself each execution.
# snake_case keys: this JSON is read verbatim by MaterialsReplSession.collectChangedMaterials.
import json as _repl_json

_repl_changed = [
    {"variable_name": _repl_name, "config": _repl_value.to_dict()}
    for _repl_name, _repl_value in list(globals().items())
    if isinstance(_repl_value, _ReplMaterial)
    and not _repl_name.startswith("_")
    and _repl_name not in _reserved_input_names
    and _repl_identities_before.get(_repl_name) != id(_repl_value)
]
_repl_export = _repl_json.dumps(_repl_changed)
