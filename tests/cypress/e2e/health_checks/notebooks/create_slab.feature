# This file was generated. Do not edit it manually, unless temporarily for debugging purposes.
@notebook_healthcheck
Feature: Notebook healthcheck to create "O3SrTi(001), termination TiO2_P4/mmm_3, Slab"

  Scenario:
    When I open materials designer page
    Then I see material designer page
    And I import materials from Standata
      | name | index |
      | SrTiO3, Strontium Titanate, CUB (Pm-3m) 3D (Bulk), mp-5229 | 2 |
    Then material with following name exists in state
      | name | index |
      | SrTiO3, Strontium Titanate, CUB (Pm-3m) 3D (Bulk), mp-5229 | 2 |

    # Open
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened

    # Open notebook
    When I double click on "create_slab.ipynb" entry in sidebar
    And I see file "create_slab.ipynb" opened

    # Select material
    And I select materials in MaterialsSelector
      | name | index |
      | SrTiO3, Strontium Titanate, CUB (Pm-3m) 3D (Bulk), mp-5229 | 2 |

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    And I submit materials
    Then material with following name exists in state
      | name | index |
      | O3SrTi(001), termination TiO2_P4/mmm_3, Slab | 3 |
