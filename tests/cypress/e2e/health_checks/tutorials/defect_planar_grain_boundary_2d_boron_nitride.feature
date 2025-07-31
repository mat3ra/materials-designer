# This file was generated. Do not edit it manually, unless temporarily for debugging purposes.
@notebook_healthcheck
Feature: Healthcheck to create BN, Hexagonal Boron Nitride, HEX (P6/mmm) 2D (Monolayer), 2dm-4991, Grain Boundary (9.00°)

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
    When I double click on "defect_planar_grain_boundary_2d_boron_nitride.ipynb" entry in sidebar
    And I see file "defect_planar_grain_boundary_2d_boron_nitride.ipynb" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    Then I see file "grain_boundary_2d_boron_nitride.json" on filesystem
    And I submit materials
    Then material with following name exists in state
      | name                      | index                      |
      | BN, Hexagonal Boron Nitride, HEX (P6/mmm) 2D (Monolayer), 2dm-4991, Grain Boundary (9.00°) | 2 |
