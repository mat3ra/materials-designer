[![npm version](https://badge.fury.io/js/%40exabyte-io%2Fmaterials-designer.svg)](https://badge.fury.io/js/%40exabyte-io%2Fmaterials-designer)
[![License: Apache](https://img.shields.io/badge/License-Apache-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0)

# Materials Designer

A standalone React application for atomistic structural design. Deployed within the Mat3ra.com platform as documented [here](https://docs.mat3ra.com/materials-designer/overview/) and can be used as a library in any web/Node.js application.

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

then start the application using Node v14.19:

```bash
cd materials-designer
npm install
npm start
```

> Some files might not be downloaded by `git clone` or `git pull` commands if your system doesn't have `git-lfs` installed.
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

As below and further documented [here](https://docs.mat3ra.com/materials-designer/overview/):

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
  - add a skeleton material with (+) button to the materials list (combines functionality of "Edit" -> "Clone" and "I/O" -> "Import...")
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

Tests are implemented using Cypress. To launch it use Node v20 and run:

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

This package depends on [Made](https://github.com/mat3ra/made), [Wave](https://github.com/Exabyte-io/wave.js), and [Cove.js](https://github.com/Exabyte-io/cove.js) among other packages. For the full list, see [package.json](package.json).

### 3.4. CI Docker files

Two docker files were used for testing in CI. In principle, we could use
more targeted base images for the use case (e.g. `node` or `selenium` images),
but we want to verify the correct behavior
on a specific CentOS version. The first `dockerfiles/centos/Dockerfile` builds and
runs the application. The second `dockerfiles/test/Dockerfile` provisions and runs
the tests. The `test` image uses the `centos` image as a base and is related by the
`entrypoint.sh` script. It is targeted for CI so if you are editing
the `entrypoint.sh` you may need to re-build both containers for your changes to
work. It can also be useful to comment out the `ENTRYPOINT` in the `centos` dockerfile
as well as the `CMD` in the `test` dockerfile in order to easily run and debug both
containers. There is also a `docker-compose.yml` file, which can be used for local
building and testing. Provided `docker-compose` is installed, it can be used like so:

```bash
docker-compose build materials-designer
docker-compose build materials-designer-test

docker-compose up -d materials-designer
sleep 30  # let the app actually start
docker-compose run materials-designer-test
```

To run tests in the container use default profile by not specifying it:
  
```bash
docker-compose up -d --build
```

For debugging purposes, Materials Designer and test container can be run interactively with access via VNC:

```bash
docker-compose --profile use-vnc up -d --build
```

Then connect to `vnc://localhost:5920` with a VNC client. The password is `123`.

### 3.5. Using Cove.js for local development

If need to link Cove.js into the app for local development, you need

1. Add the local path of Cove.js to package.json
```bash
    "@exabyte-io/cove.js": "file:../../cove.js"
```
2. Run the app
```bash
    npm start
```

If you need to re-link it again, remove node_modules in cove.js and the app, run npm install, then run npm start again. 


## 4. Links

1. [Create React App, GitHub Repository](https://github.com/facebook/create-react-app)
2. [Mat3ra Platform documentation for materials designer](https://docs.mat3ra.com/materials-designer/overview/).
