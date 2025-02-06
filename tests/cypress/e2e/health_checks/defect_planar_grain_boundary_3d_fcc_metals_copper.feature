@notebook_healthcheck
Feature: Healthcheck to create Cu4(310)-Cu4(-3-10), Grain Boundary

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
    When I double click on "defect_planar_grain_boundary_3d_fcc_metals_copper.ipynb" entry in sidebar
    And I see file "defect_planar_grain_boundary_3d_fcc_metals_copper.ipynb" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    Then I see file "Cu-(3, 1, 0)-(-3, -1, 0)_grain_boundary.json" on filesystem
    And I submit materials
    Then material with following name exists in state
      | name                      | index                      |
      | Cu4(310)-Cu4(-3-10), Grain Boundary | 2 |
