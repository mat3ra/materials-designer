_repl_identities_before = {
    _name: id(_value)
    for _name, _value in list(globals().items())
    if isinstance(_value, _ReplMaterial)
}
