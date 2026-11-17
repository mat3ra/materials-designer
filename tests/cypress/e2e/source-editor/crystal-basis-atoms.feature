Feature: User can edit labels and magnetic moments of each atom in the Atoms view of the crystal basis

  Scenario:
    When I open materials designer page
    Then I see material designer page
    When I open Standata dialog
    And I import material "FeO, Iron Oxide, MCLC (C2/m) 3D (Bulk), mp-1274279" from Standata
    And I select material with index "2" from material designer items list
    And I set atom values in the crystal basis with the following data:
      | index | field          | value |
      | 1     | magneticMoment | 0.5   |
      | 2     | magneticMoment | -0.5  |
      | 4     | label          | 10    |
      | 4     | label          | 1.5   |
    Then material with following data exists in state
      | path          | index   |
      | feo-afm.json  | $INT{2} |
