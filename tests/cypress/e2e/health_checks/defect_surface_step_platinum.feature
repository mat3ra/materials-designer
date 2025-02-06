@notebook_healthcheck
Feature: Healthcheck to create Pt4(211), termination Pt_Pmmm_4, Slab

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
    When I double click on "defect_surface_step_platinum.ipynb" entry in sidebar
    And I see file "defect_surface_step_platinum.ipynb" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    Then I see file "Pt_211_step.json" on filesystem
    And I submit materials
    Then material with following name exists in state
      | name                      | index                      |
      | Pt4(211), termination Pt_Pmmm_4, Slab | 2 |
