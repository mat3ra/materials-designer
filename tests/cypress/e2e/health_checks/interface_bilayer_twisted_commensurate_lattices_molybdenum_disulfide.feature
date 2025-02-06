@notebook_healthcheck
Feature: Healthcheck to create Twisted Bilayer Interface (21.79 degrees)

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
    When I double click on "interface_bilayer_twisted_commensurate_lattices_molybdenum_disulfide.ipynb" entry in sidebar
    And I see file "interface_bilayer_twisted_commensurate_lattices_molybdenum_disulfide.ipynb" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    Then I see file "twisted_interface_0.json" on filesystem
    And I submit materials
    Then material with following name exists in state
      | name                      | index                      |
      | Twisted Bilayer Interface (21.79 degrees) | 2 |
