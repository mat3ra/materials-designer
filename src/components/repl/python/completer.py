import jedi as _repl_jedi
import json as _repl_cjson

def _repl_complete(_src, _line, _col):
    try:
        _comps = _repl_jedi.Interpreter(_src, [globals()]).complete(_line, _col)
    except Exception:
        return "[]"
    # Surface the current call's keyword-argument (param) completions first — inside a call Jedi
    # otherwise returns them alphabetically, buried under builtins. Mirrors how IDEs rank params.
    _params = [_c for _c in _comps if _c.type == "param"]
    _others = [_c for _c in _comps if _c.type != "param"]
    _ordered = (_params + _others)[:60]
    return _repl_cjson.dumps([{"name": _c.name, "type": _c.type} for _c in _ordered])

def _repl_describe(_src, _line, _col, _name):
    try:
        for _c in _repl_jedi.Interpreter(_src, [globals()]).complete(_line, _col):
            if _c.name == _name:
                try:
                    _sigs = _c.get_signatures()
                    _sig = _sigs[0].to_string() if _sigs else ""
                except Exception:
                    _sig = ""
                try:
                    _doc = _c.docstring(raw=True)
                except Exception:
                    _doc = ""
                return _repl_cjson.dumps({"signature": _sig, "docstring": _doc})
    except Exception:
        pass
    return _repl_cjson.dumps({"signature": "", "docstring": ""})
