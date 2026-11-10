Feature: User can edit labels and magnetic moments of each atom in the Atoms view of the crystal basis

  Scenario:
    When I open materials designer page
    Then I see material designer page
    When I set material basis and lattice with the following data:
      | basis                                                     | lattice                  |
      | Fe 0 0 0;Fe 0.5 0.5 0.5;O 0.25 0.25 0.25;O 0.75 0.75 0.75 | {"type":"CUB","a":4.334} |
    And I select "atoms" view of the crystal basis
    And I set atom values in the crystal basis with the following data:
      | index | field          | value |
      | 1     | magneticMoment | 0.5   |
      | 2     | magneticMoment | -0.5  |
      | 4     | label          | 10    |
    Then material with following data exists in state
      | path          | index   |
      | feo-afm.json  | $INT{1} |
    And atom with index "3" has no "magneticMoments" value in state

    # A refused value shows made's validation message and is not stored
    When I set atom values in the crystal basis with the following data:
      | index | field | value |
      | 4     | label | 1.5   |
    Then I see error alert "/basis/labels/4/value must be integer"
    And material with following data exists in state
      | path          | index   |
      | feo-afm.json  | $INT{1} |

    # An XYZ edit keeps labels and magnetic moments by line
    When I select "crystal" view of the crystal basis
    And I add line "O 0.5 0.5 0" to material basis
    Then material with following data exists in state
      | path                     | index   |
      | feo-afm-added-atom.json  | $INT{1} |
