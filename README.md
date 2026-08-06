[![npm version](https://badge.fury.io/js/%40exabyte-io%2Fmaterials-designer.svg)](https://badge.fury.io/js/%40exabyte-io%2Fmaterials-designer)
[![License: Apache](https://img.shields.io/badge/License-Apache-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

# Materials Designer

A standalone React application for atomistic structural design. Deployed within the Mat3ra.com platform as
documented [here](https://docs.mat3ra.com/materials-designer/overview/) and can be used as a library in any web/Node.js
application.

[Try Materials Designer in action here](https://mat3ra-materials-designer.netlify.app/)

![Materials Designer in action](https://i.imgur.com/f7NvNNl.png)

## 1. Installation

### 1.1. From source

Materials Designer can be installed from the source as follows:

```bash
git clone git@github.com:Exabyte-io/materials-designer.git
```

Or use https, if no SSH authentication is set up with GitHub:

```bash
git clone https://github.com/Exabyte-io/materials-designer.git
```

then start the application using Node v20.18:

```bash
cd materials-designer
npm install
npm start
```

> Some files might not be downloaded by `git clone` or `git pull` commands if your system doesn't have `git-lfs`
> installed.
> To fix this run (on OSX):
> ```
> brew install git-lfs
> git lfs pull
> ```

Open http://localhost:3001 to view the application in the browser.

### 1.2. Using Docker

See the Docker Files section below.

## 2. Functionality

### 2.1. Current Functionality

As documented [here](https://docs.mat3ra.com/materials-designer/overview/):

- Input/Output Menu
    - Export materials in JSON/POSCAR formats
- Edit Menu
    - Undo/Redo/Reset/Clone operations
- View
    - Fullscreen mode
    - Multi-material Editor (combining multiple materials into one)
- Advanced Menu
    - Creating supercells
    - Creating surfaces/slabs
    - Creating combinatorial sets
    - Creating interpolated sets
    - Run Python Script
    - Launch a Jupyter Lite session
- Basis Editor
    - Adding/Removing/Modifying sites
    - Adding/Removing/Modifying atomic constraints
    - Switching Crystal/Cartesian units
- Lattice Editor
    - Adjusting lattice units/types/parameters
- 3D Editor
    - Visualizing materials
        - Rotation
        - Repetition/Radius
        - Toggle axes
    - Adjusting materials
        - add/remove/select atoms
        - multiple selection with drag-and-drop

### 2.2. TODO list

Desirable features/fixes for implementation.

General Improvements:

- switch the color back to white when the material is back to the original after editing
- show the total number of materials in the list and the current index
- fix fullscreen support
- add lattice vectors form to change lattice vectors in a 3x3 matrix with all components explicitly:
- highlight atoms that are selected in the source editor in the 3D editor and vice versa
- add the ability to drop files with material structural data to the materials list
    - ESSE JSON and POSCAR parsers already implemented in made.js
    - add a skeleton material with (+) button to the materials list (combines functionality of "Edit" -> "Clone" and "
      I/O" -> "Import...")
- save the state of Materials Designer to share materials and exact visualization via URL link.
    - the idea is to be able to share an exact copy of the state of the application
    - materials data is stored in the redux store
    - visualization settings stored in wave.js components, via `useState()` hook

Specific features:

- add logic for Interstitials and vacancy concentrations in combinatorial sets

Developer Experience:

- add tests for all the functionality listed above. We only test advanced operations at current.
- fix modal dialog exceptions for AdvancedGeometryDialog
- remove the `updateIndex` action when the index is the same

## 3. Development

### 3.1. Run the application

Execute the following commands when running the application in development mode. Use Node v14.19

```bash
npm install
npm start
```

### 3.2. Tests

All tests live under `tests/`, so `src/` contains only shipped source:

```
tests/
  vitest/    <- run by THIS package (npm run test:unit / test:pyodide)
  cypress/   <- run by tests/package.json (its own package, Node v20)
```

The two Vitest suites share `vite.config.mts` as two projects; the `*.pyodide.test.ts` suffix routes a
file between them:

| Command | What it covers | Speed |
| --- | --- | --- |
| `npm run test:unit` (= `npm test`) | `tests/vitest/*.test.ts` — reducers, the REPL session's JS half | seconds |
| `npm run test:pyodide` | `tests/vitest/*.pyodide.test.ts` — the REPL against a real Pyodide interpreter (see 3.7) | minutes |

End-to-end tests are Cypress and live in their own package; use Node v20:

```bash
cd tests
npm install
npm test
```

To run a specific test feature, pass its relative path as an option:

```bash
sh run-tests.sh -f=menu/advanced/create-supercell.feature
```

### 3.3. Dependencies

This package depends on [Made](https://github.com/mat3ra/made), [Wave](https://github.com/Exabyte-io/wave.js),
and [Cove.js](https://github.com/Exabyte-io/cove.js) among other packages. For the full list,
see [package.json](package.json).

### 3.4. CI Docker files

The first `dockerfiles/app/Dockerfile` builds and runs the application. The second `dockerfiles/tests/Dockerfile` provisions and runs the tests. 

Provided `docker compose` is installed, it can be used like so:

```bash
docker compose build materials-designer
docker compose build materials-designer-test

docker compose up -d materials-designer
sleep 30  # let the app actually start
docker compose run materials-designer-test
```

To run tests in the container use default profile by not specifying it:

```bash
docker compose up -d --build
```

To run on MacOS, add CYPRESS_BASE_URL=http://host.docker.internal:3001 to the environment variables in the test container

```
CYRPRESS_BASE_URL=http://host.docker.internal:3001 docker compose run materials-designer-test
```

To run both services and execute tests:

```
CYPRESS_BASE_URL=http://host.docker.internal:3001 docker compose up --abort-on-container-exit --exit-code-from materials-designer-test
```

For debugging purposes, Materials Designer and test container can be run interactively with access via VNC:

```bash
docker compose --profile use-vnc up -d --build
```

Then connect to `vnc://localhost:5920` with a VNC client. The password is `123`. (Port set in `.env` file.)
Make sure to have VNC client installed on the system, when address is typed in the Chrome browser, the VNC prompt will
appear.

### 3.5. Using Cove.js for local development

If need to link Cove.js into the app for local development, you need

1. Add the local path of Cove.js to package.json

```bash
    "@mat3ra/cove": "file:../../cove.js"
```

2. Run the app

```bash
    npm start
```

If you need to re-link it again, remove node_modules in cove.js and the app, run npm install, then run npm start again.
### 3.6. Running tests for JupyterLite Notebooks

To run tests for JupyterLite Notebooks, set the environment variable in `.env` file.
And update the URL for JL dev distribution by getting the URL from the JupyterLite PR preview.

```bash
VITE_USE_JUPYTERLITE_DEV_URL=true
VITE_JUPYTERLITE_DEVELOPMENT_URL="https://deploy-preview-56--mat3ra-jupyterlite.netlify.app"
```

This should source JL from the development distribution and run only notebook healthcheck tests.

### 3.7. Python REPL (Pyodide)

The **View → Python REPL** panel runs `mat3ra.made.tools` in the browser via
[Pyodide](https://pyodide.org). Materials in the designer are bound as `materials_in` (list order) and
`material` (the active one); any `Material` the user creates or reassigns is synced back into the list.

**The environment is defined in one place:**
[`src/components/repl/repl-packages.json`](src/components/repl/repl-packages.json) — Pyodide version,
package lists and wheel filenames. `constants.ts`, `scripts/provision-repl-wheels.mjs` and the
integration test all read it, so a version bump happens once.

Not everything comes from PyPI: `pymatgen`, `pydantic`, `spglib` and friends do not build under
Pyodide, so the REPL installs **prebuilt pure-Python wheels** that are not published on PyPI.

#### Hosting requirement (important when embedding this package)

Those wheels must be served at **`/repl-wheels/`** on the same origin as the app, or the REPL fails at
load time with `Failed to fetch wheel …: HTTP 404`.

- **In this repo** it is automatic: `provision-repl-wheels` runs on `prestart` and `prebuild`,
  downloading them into `public/repl-wheels/`, which Vite copies into the build output. The
  notebooks-utils wheel is committed there because it pins the unreleased API revision recorded in
  the package manifest; the remaining generated downloads are gitignored.
- **In a host application** that consumes `@mat3ra/materials-designer`, nothing runs on your behalf.
  Either serve the wheels yourself at that path, or pass a different location:

  ```jsx
  <MaterialsDesignerContainer wheelBaseUrl="https://your-cdn.example/wheels" />
  ```

They are downloaded from [jupyterlite.mat3ra.com](https://jupyterlite.mat3ra.com/files/packages/),
which already hosts them for the JupyterLite kernel — so that site is a build-time dependency of this
repo. Override with `REPL_WHEELS_SOURCE_URL`:

```bash
REPL_WHEELS_SOURCE_URL=https://your-mirror.example/packages npm run provision-repl-wheels
```

#### Authoring the REPL's Python

The reusable preamble and host-sync helpers live in the `mat3ra-notebooks-utils` package. Materials
Designer only owns the environment manifest and the hooks that call those helpers before and after a
run.

#### Running the integration test

```bash
npm run provision-repl-wheels   # once; wheels are cached on disk
npm run test:pyodide            # builds a real Pyodide env — minutes
```

It drives the real `MaterialsReplSession`, so it also covers the install ordering, the wheel handling
and the error/completion paths rather than re-declaring them.

## 4. Links

1. [Create React App, GitHub Repository](https://github.com/facebook/create-react-app)
2. [Mat3ra Platform documentation for materials designer](https://docs.mat3ra.com/materials-designer/overview/).
