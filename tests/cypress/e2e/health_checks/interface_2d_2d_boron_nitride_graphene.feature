@notebook_healthcheck
Feature: Healthcheck to create C2(001)-BN(001), Interface, Strain 0.401pct

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
    When I double click on "interface_2d_2d_boron_nitride_graphene.ipynb" entry in sidebar
    And I see file "interface_2d_2d_boron_nitride_graphene.ipynb" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    Then I see file "interface_0.json" on filesystem
    And I submit materials
    Then material with following name exists in state
      | name                      | index                      |
      | C2(001)-BN(001), Interface, Strain 0.401pct | 2 |
