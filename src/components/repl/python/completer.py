# Jedi-backed completion for the editor. jedi.Interpreter completes against the LIVE REPL globals (not
# just static analysis of the typed text), so it knows the user's actual variables, their attributes,
# imported modules and keywords — not only the pre-imported helper functions. Called on every
# keystroke from the JS side (PyodideReplSession.complete/describe), so this stays cheap: signature
# and docstring lookup is a separate, on-demand call (describe), not done for every candidate up front.
import jedi as _repl_jedi
import json as _repl_cjson

def _repl_complete(_repl_source, _repl_line, _repl_column):
    try:
        _repl_completions = _repl_jedi.Interpreter(_repl_source, [globals()]).complete(_repl_line, _repl_column)
    except Exception:
        return "[]"
    # Surface the current call's keyword-argument (param) completions first — inside a call Jedi
    # otherwise returns them alphabetically, buried under builtins. Mirrors how IDEs rank params.
    _repl_params = [_completion for _completion in _repl_completions if _completion.type == "param"]
    _repl_others = [_completion for _completion in _repl_completions if _completion.type != "param"]
    _repl_ordered = (_repl_params + _repl_others)[:60]
    return _repl_cjson.dumps(
        [{"name": _completion.name, "type": _completion.type} for _completion in _repl_ordered]
    )

def _repl_describe(_repl_source, _repl_line, _repl_column, _repl_target_name):
    try:
        for _completion in _repl_jedi.Interpreter(_repl_source, [globals()]).complete(_repl_line, _repl_column):
            if _completion.name == _repl_target_name:
                try:
                    _repl_signatures = _completion.get_signatures()
                    _repl_signature = _repl_signatures[0].to_string() if _repl_signatures else ""
                except Exception:
                    _repl_signature = ""
                try:
                    _repl_docstring = _completion.docstring(raw=True)
                except Exception:
                    _repl_docstring = ""
                return _repl_cjson.dumps({"signature": _repl_signature, "docstring": _repl_docstring})
    except Exception:
        pass
    return _repl_cjson.dumps({"signature": "", "docstring": ""})
