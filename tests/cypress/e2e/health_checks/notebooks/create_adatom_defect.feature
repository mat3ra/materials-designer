@notebook_healthcheck
Feature: Healthcheck to create ${material_name}

  Scenario:
    When I open materials designer page
    Then I see material designer page
    And I import materials from Standata
      | name | index |
      | Ni, Nickel, FCC (Fm-3m) 3D (Bulk), mp-23 | 2 |
    Then material with following name exists in state
      | name | index |
      | Ni, Nickel, FCC (Fm-3m) 3D (Bulk), mp-23 | 2 |

    # Open
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened

    # Open notebook
    When I double click on "create_adatom_defect.ipynb" entry in sidebar
    And I see file "create_adatom_defect.ipynb" opened

    # Select material
    And I select materials in MaterialsSelector
      | name | index |
      | Ni, Nickel, FCC (Fm-3m) 3D (Bulk), mp-23 | 2 |

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    And I submit materials
    Then material with following name exists in state
      | name | index |
      | Ni(111), termination Ni_P6/mmm_4, Slab, Adatom Si Defect | 3 |
