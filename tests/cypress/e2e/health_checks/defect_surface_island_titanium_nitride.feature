@notebook_healthcheck
Feature: Healthcheck to create N4Ti4(001), termination TiN_P4/mmm_4, Slab

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
    When I double click on "defect_surface_island_titanium_nitride.ipynb" entry in sidebar
    And I see file "defect_surface_island_titanium_nitride.ipynb" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    Then I see file "TiN_slab_with_island.json" on filesystem
    And I submit materials
    Then material with following name exists in state
      | name                      | index                      |
      | N4Ti4(001), termination TiN_P4/mmm_4, Slab | 2 |
