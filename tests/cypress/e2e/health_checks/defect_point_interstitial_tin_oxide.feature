@notebook_healthcheck
Feature: Healthcheck to create Sn15 O17, Interstitial O Defect

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
    When I double click on "defect_point_interstitial_tin_oxide.ipynb" entry in sidebar
    And I see file "defect_point_interstitial_tin_oxide.ipynb" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    Then I see file "Sn15 O17, Interstitial O Defect.json" on filesystem
    And I submit materials
    Then material with following name exists in state
      | name                      | index                      |
      | Sn15 O17, Interstitial O Defect | 2 |
