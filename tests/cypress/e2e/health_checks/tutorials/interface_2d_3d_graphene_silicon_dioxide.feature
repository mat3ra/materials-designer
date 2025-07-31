# This file was generated. Do not edit it manually, unless temporarily for debugging purposes.
@notebook_healthcheck
Feature: Healthcheck to create C(001)-O2Si(001), Interface, Strain 1.858pct.json

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
    When I double click on "interface_2d_3d_graphene_silicon_dioxide.ipynb" entry in sidebar
    And I see file "interface_2d_3d_graphene_silicon_dioxide.ipynb" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    Then I see file "C(001)-O2Si(001), Interface, Strain 1.858pct.json" on filesystem
    And I submit materials
    Then material with following name exists in state
      | name                      | index                      |
      | C(001)-O2Si(001), Interface, Strain 1.858pct.json | 2 |
