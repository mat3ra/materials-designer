# Records the object identity of every in-scope Material BEFORE user code runs, so that afterwards
# collect_changed_materials.py can tell which bindings this execution actually created or replaced
# (not merely which ones exist).
#
# id() rather than equality on purpose: a rebind counts as a change even when the new value happens
# to be `==` the old one. That is what lets `supercell = create_supercell(...)` be detected as
# "supercell changed" even on a re-run where nothing about the resulting shape differs.
_repl_identities_before = {
    _repl_name: id(_repl_value)
    for _repl_name, _repl_value in list(globals().items())
    if isinstance(_repl_value, _ReplMaterial)
}
