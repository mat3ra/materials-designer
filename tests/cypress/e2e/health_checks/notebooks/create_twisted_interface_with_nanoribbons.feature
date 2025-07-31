# This file was generated. Do not edit it manually, unless temporarily for debugging purposes.
@notebook_healthcheck
Feature: Notebook healthcheck to create "Twisted Nanoribbon Interface (15.00 degrees)"

  Scenario:
    When I open materials designer page
    Then I see material designer page
    And I import materials from Standata
      | name | index |
      | BN, Hexagonal Boron Nitride, HEX (P6/mmm) 2D (Monolayer), 2dm-4991 | 2 |
    Then material with following name exists in state
      | name | index |
      | BN, Hexagonal Boron Nitride, HEX (P6/mmm) 2D (Monolayer), 2dm-4991 | 2 |

    # Open
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened

    # Open notebook
    When I double click on "create_twisted_interface_with_nanoribbons.ipynb" entry in sidebar
    And I see file "create_twisted_interface_with_nanoribbons.ipynb" opened

    # Select material
    And I select materials in MaterialsSelector
      | name | index |
      | BN, Hexagonal Boron Nitride, HEX (P6/mmm) 2D (Monolayer), 2dm-4991 | 2 |

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    And I submit materials
    Then material with following name exists in state
      | name | index |
      | Twisted Nanoribbon Interface (15.00 degrees) | 3 |
