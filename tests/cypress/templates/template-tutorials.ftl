# This file was generated. Do not edit it manually, unless temporarily for debugging purposes.
${tags}
Feature: Healthcheck to create ${tutorial_material_name}

  Scenario:
    When I open materials designer page
    Then I see material designer page

    # Open
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened

    # Open notebook
    When I double click on "specific_examples" entry in sidebar
    Then I see "/made/specific_examples/" in path
    When I double click on "${tutorial_notebook_name}" entry in sidebar
    And I see file "${tutorial_notebook_name}" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    Then I see file "${tutorial_material_file_name}" on filesystem
    And I submit materials
    Then material with following name exists in state
      | name                      | index                      |
      | ${tutorial_material_name} | ${tutorial_material_index} |
