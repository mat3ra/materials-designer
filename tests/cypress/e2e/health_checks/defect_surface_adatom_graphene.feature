@notebook_healthcheck
Feature: Healthcheck to create C, Graphene, HEX (P6/mmm) 2D (Monolayer), 2dm-3993, Adatom Li Defect

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
    When I double click on "defect_surface_adatom_graphene.ipynb" entry in sidebar
    And I see file "defect_surface_adatom_graphene.ipynb" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    Then I see file "Li_adatom.json" on filesystem
    And I submit materials
    Then material with following name exists in state
      | name                      | index                      |
      | C, Graphene, HEX (P6/mmm) 2D (Monolayer), 2dm-3993, Adatom Li Defect | 2 |
