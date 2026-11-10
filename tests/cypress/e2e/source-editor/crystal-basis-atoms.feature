Feature: User can edit labels and magnetic moments of each atom in the Atoms view of the crystal basis

  Scenario:
    When I open materials designer page
    Then I see material designer page
    When I set material basis and lattice with the following data:
      | basis                                                     | lattice                  |
      | Fe 0 0 0;Fe 0.5 0.5 0.5;O 0.25 0.25 0.25;O 0.75 0.75 0.75 | {"type":"CUB","a":4.334} |
    And I set atom values in the crystal basis with the following data:
      | index | field          | value |
      | 1     | magneticMoment | 0.5   |
      | 2     | magneticMoment | -0.5  |
      | 4     | label          | 10    |
      | 4     | label          | 1.5   |
    Then material with following data exists in state
      | path          | index   |
      | feo-afm.json  | $INT{1} |
