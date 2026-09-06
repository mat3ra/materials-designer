@parity_2_0
Feature: One undo stack, whatever surface made the edit

  # v1 had two: the reducer's and the 3D editor's, so undoing after switching surfaces could
  # resurrect state from the other one. In 2.0 every edit is an operation on one log, so a single
  # Cmd+Z means the same thing everywhere.

  Background:
    When I open materials designer page
    Then I see material designer page

  Scenario: An edit from a panel and an edit from the inspector share one history
    When I open the "supercell" operation panel
    And I set the supercell matrix diagonal to "2"
    And I apply the "supercell" operation panel
    Then I see the timeline has 2 steps

    When I open the command palette
    And I run "Use conventional cell" from the command palette
    Then I see the timeline has 3 steps

    When I press "ctrl+z" outside any text field
    Then I see the timeline has 2 steps
    And I see the active material has 16 atoms

    When I press "ctrl+z" outside any text field
    Then I see the timeline has 1 step
    And I see the active material has 2 atoms

    # The origin is not an edit, so there is nothing left to undo.
    When I press "ctrl+z" outside any text field
    Then I see the timeline has 1 step

    When I press "ctrl+shift+z" outside any text field
    Then I see the timeline has 2 steps
    And I see the active material has 16 atoms
