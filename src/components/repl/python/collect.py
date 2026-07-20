import json as _json
_repl_changed = [
    {"variable_name": _name, "config": _value.to_dict()}
    for _name, _value in list(globals().items())
    if isinstance(_value, _ReplMaterial)
    and not _name.startswith("_")
    and _name not in _reserved_input_names
    and _repl_identities_before.get(_name) != id(_value)
]
_repl_export = _json.dumps(_repl_changed)
