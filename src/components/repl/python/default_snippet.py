# `materials_in` is the designer's material list, in list order; `material` is the
# currently selected one. Both are re-fetched fresh each time you run (Shift+Enter),
# so this always reflects the current designer state — re-running redoes generation.
# All mat3ra.made.tools helpers are pre-imported — start typing (e.g. "create_") to autocomplete.
# Any Material you create or reassign here is synced back into the list and viewer.
supercell = create_supercell(materials_in[0], scaling_factor=[2, 2, 1])
