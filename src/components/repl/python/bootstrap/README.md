# REPL bootstrap scripts

Every `.py` here runs into the REPL namespace at startup, alphabetically. Drop a file in, run
`npm run generate-repl-python`, done — nothing to register in TypeScript.

```python
# bootstrap/import_enums.py
from mat3ra.made.tools.build.pristine_structures.zero_dimensional.nanoparticle.enums import NanoparticleShapesEnum
```

-   Public names land in the user's namespace and autocomplete. Prefix internals with `_repl_`.
-   Keep each file self-contained: they share one namespace, so relying on a name left by a file that
    sorts earlier breaks as soon as someone adds `a_something.py`.
