# This file was generated. Do not edit it manually, unless temporarily for debugging purposes.
@notebook_healthcheck
Feature: Healthcheck to create Cu(001)-O2Si(001), Interface, Strain 8.787pct.json

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
    When I double click on "interface_3d_3d_copper_cristobalite.ipynb" entry in sidebar
    And I see file "interface_3d_3d_copper_cristobalite.ipynb" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    Then I see file "Cu(001)-O2Si(001), Interface, Strain 8.787pct.json" on filesystem
    And I submit materials
    Then material with following name exists in state
      | name                      | index                      |
      | Cu(001)-O2Si(001), Interface, Strain 8.787pct.json | 2 |
