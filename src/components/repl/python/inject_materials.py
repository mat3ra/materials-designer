# Binds the designer's materials into the REPL namespace, reading the two globals the JS side sets
# immediately before running this (see MaterialsReplSession.injectMaterials): `_repl_injected_json`
# and `_repl_active_index`.
#
# This runs before EVERY execution, not just at startup, which is what makes re-running the same
# snippet idempotent rather than cumulative. Both names bound here are listed in
# REPL_INPUT_VARIABLE_NAMES so collect_changed_materials.py skips them - without that, this rebind
# would look exactly like the user having created new Materials, and every run would sync them back.
#
# Precondition: the caller guarantees a non-empty list (MaterialsReplSession.injectMaterials returns
# early otherwise), so `materials_in[0]` below is always safe.
import json as _repl_json

_repl_injected_materials = [
    _ReplMaterial.create_from_config_or_class_instance(_repl_config)
    for _repl_config in _repl_json.loads(_repl_injected_json)
]
materials_in = _repl_injected_materials
# The index is range-checked because the designer's selection can briefly point past the end of the
# list (e.g. between removing the last material and the next render); first material is the fallback.
material = (
    _repl_injected_materials[_repl_active_index]
    if 0 <= _repl_active_index < len(_repl_injected_materials)
    else _repl_injected_materials[0]
)
