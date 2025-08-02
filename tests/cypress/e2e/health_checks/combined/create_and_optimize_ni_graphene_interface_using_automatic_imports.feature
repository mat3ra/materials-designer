# This file was generated. Do not edit it manually, unless temporarily for debugging purposes.
@notebook_healthcheck
Feature: Combined test to create interface with relaxation and optimization

  Scenario:
    When I open materials designer page
    Then I see material designer page

    # Open JupyterLite
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened

    # Create interface with automatic material import
    When I double click on "create_interface_with_min_strain_zsl.ipynb" entry in sidebar
    And I see file "create_interface_with_min_strain_zsl.ipynb" opened
    And I deselect all materials
    And I Run All Cells
    And I see kernel status is Idle
    And I submit materials
    Then material with following name exists in state
      | name | index |
      | C(001)-Ni(001), Interface, Strain 8.308pct | 2 |

    # Optimize film position
    # Open JupyterLite
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened

    When I double click on "optimize_film_position.ipynb" entry in sidebar
    And I see file "optimize_film_position.ipynb" opened
    And I select materials in MaterialsSelector
      | name | index |
      | C(001)-Ni(001), Interface, Strain 8.308pct | 2 |
    And I Run All Cells
    And I see kernel status is Idle
    And I submit materials
    Then material with following name exists in state
      | name | index |
      | C(001)-Ni(001), Interface, Strain 8.308pct Optimized XY | 3 |

    # Relax with EMT
    # Open JupyterLite
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened

    When I double click on "create_interface_with_relaxation_ase_emt.ipynb" entry in sidebar
    And I see file "create_interface_with_relaxation_ase_emt.ipynb" opened
    And I select materials in MaterialsSelector
      | name | index |
      | C(001)-Ni(001), Interface, Strain 8.308pct | 2 |
    And I Run All Cells
    And I see kernel status is Idle
    And I submit materials

    # Final verification
    Then material with following name exists in state
      | name | index |
      | C(001)-Ni(001), Interface, Strain 8.308pct, Relaxed with EMT | 4 |
