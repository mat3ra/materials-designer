# Everything the REPL namespace needs in place before any user code runs.
#
# `Material` is deliberately aliased to a private name, for two reasons:
#   - user code is free to rebind the plain name `Material`, and if our isinstance() checks in
#     snapshot_material_identities.py / collect_changed_materials.py used that name, such a rebind
#     would silently stop us detecting the materials the user created;
#   - the leading underscore keeps it out of the collected globals, which skip private names.
#
# The helpers are star-imported so users never have to write import lines; `helpers.__all__` bounds
# what `*` pulls in. We also count them, purely so the load log can end on something concrete
# ("Environment ready - 37 helpers pre-imported"), which doubles as proof the install really worked.
from mat3ra.made.material import Material as _ReplMaterial
from mat3ra.made.tools.helpers import *
from mat3ra.made.tools import helpers as _repl_helpers_module

_repl_helper_count = len(getattr(_repl_helpers_module, "__all__", []))
