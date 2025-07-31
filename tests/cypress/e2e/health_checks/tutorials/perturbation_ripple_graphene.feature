# This file was generated. Do not edit it manually, unless temporarily for debugging purposes.
@notebook_healthcheck
Feature: Healthcheck to create C, Graphene, HEX (P6/mmm) 2D (Monolayer), 2dm-3993 - Armchair Nanoribbon (11) (Perturbation: 0.09*(Max(0, 1.0 - 4.0*x) + Max(0, 1.0 - 4.0*y) + Max(0, 4.0*x - 3.0) + Max(0, 4.0*y - 3.0))*sin(10*pi*x)*cos(10*pi*y))

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
    When I double click on "perturbation_ripple_graphene.ipynb" entry in sidebar
    And I see file "perturbation_ripple_graphene.ipynb" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    Then I see file "Graphene_edge_perturbation.json" on filesystem
    And I submit materials
    Then material with following name exists in state
      | name                      | index                      |
      | C, Graphene, HEX (P6/mmm) 2D (Monolayer), 2dm-3993 - Armchair Nanoribbon (11) (Perturbation: 0.09*(Max(0, 1.0 - 4.0*x) + Max(0, 1.0 - 4.0*y) + Max(0, 4.0*x - 3.0) + Max(0, 4.0*y - 3.0))*sin(10*pi*x)*cos(10*pi*y)) | 2 |
