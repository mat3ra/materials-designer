@notebook_healthcheck
Feature: Healthcheck to create B-vacancy h-BN

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
    When I double click on "defect_point_vacancy_boron_nitride.ipynb" entry in sidebar
    And I see file "defect_point_vacancy_boron_nitride.ipynb" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    Then I see file "B-vacancy_hexagonal_boron_nitride.json" on filesystem
    And I submit materials
    Then material with following name exists in state
      | name                      | index                      |
      | B-vacancy h-BN | 2 |
