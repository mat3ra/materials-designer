# Emits only the Materials whose binding is new or changed since the snapshot in snapshot.py, so a
# run that doesn't touch a given variable never re-syncs it. Excludes:
#   - private/internal names (leading underscore) — that's everything this REPL session itself binds
#   - the injected input names (`materials_in`, `material`) — "Reload inputs" rebinds these, and
#     without this exclusion that rebind would look like the user created a new Material
# Wire keys are snake_case here because this dict becomes JSON consumed directly by the JS side
# (MaterialsReplSession.collectChangedMaterials), which expects `variable_name`/`config` verbatim.
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
