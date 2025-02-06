@notebook_healthcheck
Feature: Healthcheck to create H-Passivated Silicon Nanowire

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
    When I double click on "passivation_edge_nanowire_silicon.ipynb" entry in sidebar
    And I see file "passivation_edge_nanowire_silicon.ipynb" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    Then I see file "passivated_nanowire.json" on filesystem
    And I submit materials
    Then material with following name exists in state
      | name                      | index                      |
      | H-Passivated Silicon Nanowire | 2 |
