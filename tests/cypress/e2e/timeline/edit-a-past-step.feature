@parity_2_0
Feature: A step in the history can be edited, and everything after it re-runs

  # The central claim of the operation log: history is not a list of snapshots you can only walk
  # back through, it is a recipe you can change halfway down. Nothing in the v1 suite covers this
  # because v1 had no history to edit.

  Background:
    When I open materials designer page
    Then I see material designer page

  Scenario: A transform is forecast before it is applied, and becomes exactly one step
    Then I see the timeline has 1 step
    And I see the active material has 2 atoms

    When I open the "supercell" operation panel
    And I set the supercell matrix diagonal to "2"
    Then I see the "supercell" operation panel forecasts "16"
    # Modeless: the material stays on screen while its transform is being configured, which is
    # what makes a forecast worth showing.
    And I see the active material has 2 atoms

    When I apply the "supercell" operation panel
    Then I see the active material has 16 atoms
    And I see the timeline has 2 steps

  Scenario: Editing a step replaces it in place and replays what follows
    When I open the "supercell" operation panel
    And I set the supercell matrix diagonal to "2"
    And I apply the "supercell" operation panel
    And I open the command palette
    And I run "Use conventional cell" from the command palette
    Then I see the timeline has 3 steps

    When I edit timeline step 2
    # The cost of the change is stated before it is paid.
    Then I see the apply button in the "supercell" operation panel says "replay"

    When I set the supercell matrix diagonal to "3"
    And I apply the "supercell" operation panel
    Then I see the timeline has 3 steps
    And I see the active material has 54 atoms
    And I see timeline step 2 reports "2 → 54"
    And I see no steps are marked stale

    # One undo for one edit, however many steps it re-ran.
    When I press "ctrl+z" outside any text field
    Then I see the active material has 16 atoms
