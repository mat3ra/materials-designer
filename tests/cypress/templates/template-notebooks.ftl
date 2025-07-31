# This file was generated. Do not edit it manually, unless temporarily for debugging purposes.
${tags}
Feature: Healthcheck to create ${material_name}

  Scenario:
    When I open materials designer page
    Then I see material designer page
    And I import materials from Standata
${convertToTable(standata_materials)}
    Then material with following name exists in state
${convertToTable(standata_materials)}

    # Open
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened

    # Open notebook
    When I double click on "${notebook_name}" entry in sidebar
    And I see file "${notebook_name}" opened

    # Select material
    And I select materials in MaterialsSelector
${convertToTable(input_materials)}

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    And I submit materials
    Then material with following name exists in state
${convertToTable(output_materials)}
