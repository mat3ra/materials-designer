Feature: The basis can be edited as a table as well as XYZ text

  Background:
    When I open materials designer page
    Then I see material designer page
    When I show the basis as a table
    Then I see "2" sites in the basis table

  Scenario: Editing one coordinate changes only that coordinate
    When I set the "x" coordinate of site "2" to "0.4"
    Then the basis text is
      """
      Si     0.000000    0.000000    0.000000
      Si     0.400000    0.250000    0.250000
      """

  Scenario: Constraints are written only once a site is actually constrained
    # An unconstrained basis must serialise exactly as it does today
    Then the basis text is
      """
      Si     0.000000    0.000000    0.000000
      Si     0.250000    0.250000    0.250000
      """

    When I untick the "z" constraint of site "1"
    Then the basis text is
      """
      Si     0.000000    0.000000    0.000000 1 1 0
      Si     0.250000    0.250000    0.250000 1 1 1
      """

  Scenario: Sites can be added and removed
    When I add a site to the basis table
    Then I see "3" sites in the basis table
    When I remove site "3" from the basis table
    Then I see "2" sites in the basis table

  Scenario: The table and the text view show the same edits
    When I set the "y" coordinate of site "1" to "0.1"
    And I show the basis as text
    Then the basis text is
      """
      Si     0.000000    0.100000    0.000000
      Si     0.250000    0.250000    0.250000
      """
