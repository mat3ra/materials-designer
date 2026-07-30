# Emits only the Materials whose binding is new or changed since snapshot_material_identities.py ran,
# so a run that doesn't touch a given variable never re-syncs it. Two kinds of name are excluded:
#   - private/internal names (leading underscore) - that is everything this REPL session itself binds,
#     including the `_ReplMaterial` alias, so our own plumbing is never mistaken for user output;
#   - the injected input names (`materials_in`, `material`) - inject_materials.py rebinds these before
#     every run, and without this exclusion that rebind would look like the user created new Materials,
#     so the designer's own list would be appended back into itself on every execution.
# Wire keys are snake_case here because this dict becomes JSON consumed directly by the JS side
# (MaterialsReplSession.collectChangedMaterials), which expects `variable_name`/`config` verbatim.
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
