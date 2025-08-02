# This file was generated. Do not edit it manually, unless temporarily for debugging purposes.
@notebook_healthcheck @ignore
Feature: Healthcheck to import Material from File

  Scenario:
    When I open materials designer page
    Then I see material designer page

    # Open
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened

    # Open notebook
    When I double click on "import_materials_from_files.ipynb" entry in sidebar
    And I see file "import_materials_from_files.ipynb" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    And I submit materials
    Then material with following name exists in state
      | name | index |
      | Imported Material from File | 2 |
