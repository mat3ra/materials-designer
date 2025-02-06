@notebook_healthcheck
Feature: Healthcheck to create Graphene_Nickel_interface_optimized_xy

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
    When I double click on "optimization_interface_film_xy_position_graphene_nickel.ipynb" entry in sidebar
    And I see file "optimization_interface_film_xy_position_graphene_nickel.ipynb" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    Then I see file "Graphene_Nickel_interface_optimized_xy.json" on filesystem
    And I submit materials
    Then material with following name exists in state
      | name                      | index                      |
      | Graphene_Nickel_interface_optimized_xy | 2 |
