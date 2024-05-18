Feature: User can open JupyterLite Transformation dialog and create an interface with a jupyter notebook

  Scenario:
    When I open materials designer page
    Then I see material designer page
    And I open Standata dialog
    And I import material "Ni, Nickel, FCC (Fm-3m) 3D (Bulk), mp-23" from Standata
    And I open Standata dialog
    And I import material "C, Graphene, HEX (P6/mmm) 2D (Monolayer), 2dm-3993" from Standata
    And I delete materials with index "1"

    # Open
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened

    # Open notebook
    When I click on "1.1. Interface creation with Zur and McGill Superlattice (ZSL) algorithm" link
    Then I see file "create_interface_with_min_strain_zsl.ipynb" opened
    And I select material with index "2" in MaterialsSelector

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    And I submit materials
    Then material with following data exists in state
      | path              | index   |
      | zsl-gr-ni-interface.json | $INT{3} |


    # Reset the materials list
    And I delete materials with index "3"
    And I delete materials with index "2"
