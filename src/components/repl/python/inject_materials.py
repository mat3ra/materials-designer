# Binds `materials_in` / `material` from globals MaterialsReplSession.injectMaterials sets first. Runs
# before EVERY execution, which is what makes re-running a snippet idempotent rather than cumulative.
# Both names are reserved so collect_changed_materials.py ignores them. Caller guarantees a non-empty
# list, so `[0]` is safe.
import json as _repl_json

_repl_injected_materials = [
    _ReplMaterial.create_from_config_or_class_instance(_repl_config)
    for _repl_config in _repl_json.loads(_repl_injected_json)
]
materials_in = _repl_injected_materials
# Range-checked: the designer's selection can briefly point past the end of the list, e.g. between
# removing the last material and the next render.
material = (
    _repl_injected_materials[_repl_active_index]
    if 0 <= _repl_active_index < len(_repl_injected_materials)
    else _repl_injected_materials[0]
)
