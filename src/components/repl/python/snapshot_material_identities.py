# Material identities before user code runs, so collect_changed_materials.py can tell what changed.
# id() not equality: a rebind counts even when the new value happens to == the old one.
_repl_identities_before = {
    _repl_name: id(_repl_value)
    for _repl_name, _repl_value in list(globals().items())
    if isinstance(_repl_value, _ReplMaterial)
}
