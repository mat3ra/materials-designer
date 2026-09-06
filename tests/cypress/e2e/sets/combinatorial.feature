@parity_2_0
Feature: One template, many materials — and one undo to take them all back

  # A combinatorial run emits a batch. v1 dropped each one into the list as a separate material, so
  # a run of a hundred meant scrolling past a hundred rows and undoing a hundred times. In 2.0 the
  # batch is one operation: the children collapse into a set folder beside their source, and a
  # single Cmd+Z removes the lot.

  Background:
    When I open materials designer page
    Then I see material designer page

  Scenario: The batch is forecast, folded into a set, and undone in one step
    When I open the "combinatorial-set" operation panel
    And I set "combinatorial-basis" in the "combinatorial-set" operation panel to "Si/Ge 0 0 0"
    Then I see the "combinatorial-set" operation panel forecasts "2 materials"

    When I apply the "combinatorial-set" operation panel
    # The source stays a row of its own; its two children are one folder, not two rows.
    Then I see 1 set folder
    And I see the set folder holds 2 materials

    When I press "ctrl+z" outside any text field
    Then I see 0 set folders
    And I see 1 materials in the list
