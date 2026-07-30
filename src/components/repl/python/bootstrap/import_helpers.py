# `Material` is the user's; `_ReplMaterial` is ours. Plumbing must not reference a name the user can
# rebind: `Material = 5` would make collect's isinstance() raise TypeError and silently stop syncing.
# Test: "keeps syncing after a user shadows `Material`".
from mat3ra.made.material import Material, Material as _ReplMaterial

# Star import so users never write import lines; `helpers.__all__` bounds what `*` pulls in.
from mat3ra.made.tools.helpers import *
