@notebook_healthcheck
Feature: Healthcheck to create ${material_name}

  Scenario:
    When I open materials designer page
    Then I see material designer page
    And I import materials from Standata
      | name | index |
      | Ni, Nickel, FCC (Fm-3m) 3D (Bulk), mp-23 | 2 |
      | C, Graphene, HEX (P6/mmm) 2D (Monolayer), 2dm-3993 | 3 |
    Then material with following name exists in state
      | name | index |
      | Ni, Nickel, FCC (Fm-3m) 3D (Bulk), mp-23 | 2 |
      | C, Graphene, HEX (P6/mmm) 2D (Monolayer), 2dm-3993 | 3 |

    # Open
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened

    # Open notebook
    When I double click on "create_interface_with_min_strain_zsl.ipynb" entry in sidebar
    And I see file "create_interface_with_min_strain_zsl.ipynb" opened

    # Select material
    And I select materials in MaterialsSelector
      | name | index |
      | Ni, Nickel, FCC (Fm-3m) 3D (Bulk), mp-23 | 2 |
      | C, Graphene, HEX (P6/mmm) 2D (Monolayer), 2dm-3993 | 3 |

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    And I submit materials
    Then material with following name exists in state
      | name | index |
      | C(001)-Ni(001), Interface, Strain 0.244pct | 4 |
