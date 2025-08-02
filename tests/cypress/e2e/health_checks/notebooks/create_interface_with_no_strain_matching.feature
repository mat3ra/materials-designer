# This file was generated. Do not edit it manually, unless temporarily for debugging purposes.
@notebook_healthcheck
Feature: Notebook healthcheck to create "BN(001)-C(111), Interface, Strain 807.439pct"

  Scenario:
    When I open materials designer page
    Then I see material designer page
    And I import materials from Standata
      | name | index |
      | C, Graphene, HEX (P6/mmm) 2D (Monolayer), 2dm-3993 | 2 |
      | BN, Hexagonal Boron Nitride, HEX (P6/mmm) 2D (Monolayer), 2dm-4991 | 3 |
    Then material with following name exists in state
      | name | index |
      | C, Graphene, HEX (P6/mmm) 2D (Monolayer), 2dm-3993 | 2 |
      | BN, Hexagonal Boron Nitride, HEX (P6/mmm) 2D (Monolayer), 2dm-4991 | 3 |

    # Open
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened

    # Open notebook
    When I double click on "create_interface_with_no_strain_matching.ipynb" entry in sidebar
    And I see file "create_interface_with_no_strain_matching.ipynb" opened

    # Select material
    And I select materials in MaterialsSelector
      | name | index |
      | C, Graphene, HEX (P6/mmm) 2D (Monolayer), 2dm-3993 | 2 |
      | BN, Hexagonal Boron Nitride, HEX (P6/mmm) 2D (Monolayer), 2dm-4991 | 3 |

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    And I submit materials
    Then material with following name exists in state
      | name | index |
      | BN(001)-C(111), Interface, Strain 807.439pct | 4 |
