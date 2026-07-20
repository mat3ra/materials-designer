# Records the object identity of every in-scope Material BEFORE user code runs, so afterwards we can
# tell which bindings this execution actually created or replaced (not merely which exist). A rebind
# of an existing name counts as changed even if the new value happens to be `==` the old one, because
# id() tracks identity, not equality — that's what lets a reassignment like `supercell = create_...`
# be detected as "supercell changed" even when nothing about its shape differs.
_repl_identities_before = {
    _name: id(_value)
    for _name, _value in list(globals().items())
    if isinstance(_value, _ReplMaterial)
}
