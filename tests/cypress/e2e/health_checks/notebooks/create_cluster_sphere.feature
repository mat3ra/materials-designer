# This file was generated. Do not edit it manually, unless temporarily for debugging purposes.
@notebook_healthcheck
Feature: Notebook healthcheck to create "Au, Gold, FCC (Fm-3m) 3D (Bulk), mp-81 Cluster R=4.5A"

  Scenario:
    When I open materials designer page
    Then I see material designer page
    And I import materials from Standata
      | name | index |
      | Au, Gold, FCC (Fm-3m) 3D (Bulk), mp-81 | 2 |
    Then material with following name exists in state
      | name | index |
      | Au, Gold, FCC (Fm-3m) 3D (Bulk), mp-81 | 2 |

    # Open
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened

    # Open notebook
    When I double click on "create_cluster_sphere.ipynb" entry in sidebar
    And I see file "create_cluster_sphere.ipynb" opened

    # Select material
    And I select materials in MaterialsSelector
      | name | index |
      | Au, Gold, FCC (Fm-3m) 3D (Bulk), mp-81 | 2 |

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    And I submit materials
    Then material with following name exists in state
      | name | index |
      | Au, Gold, FCC (Fm-3m) 3D (Bulk), mp-81 Cluster R=4.5A | 3 |
