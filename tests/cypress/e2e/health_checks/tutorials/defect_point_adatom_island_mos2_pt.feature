# This file was generated. Do not edit it manually, unless temporarily for debugging purposes.
@notebook_healthcheck
Feature: Healthcheck to create MoS2(001), termination S_P6/mmm_1, Slab, Pt Adatom

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
    When I double click on "defect_point_adatom_island_molybdenum_disulfide_platinum.ipynb" entry in sidebar
    And I see file "defect_point_adatom_island_molybdenum_disulfide_platinum.ipynb" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    Then I see file "MoS2_Pt_island.json" on filesystem
    And I submit materials
    Then material with following name exists in state
      | name                      | index                      |
      | MoS2(001), termination S_P6/mmm_1, Slab, Pt Adatom | 2 |
