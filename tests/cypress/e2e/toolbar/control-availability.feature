Feature: Controls that cannot do anything say so

  # A control that looks live and does nothing is worse than one that is greyed out: the user
  # cannot tell a no-op from a bug. These pin down the two places that used to have that problem.

  Background:
    When I open materials designer page
    Then I see material designer page

  Scenario: Undo and redo reflect what the history can actually do
    Then I see the "undo" quick action is "disabled"
    And I see the "redo" quick action is "disabled"

    When I clone material at index "1"
    Then I see the "undo" quick action is "enabled"
    And I see the "redo" quick action is "disabled"

    When I click the "undo" quick action
    Then I see the "undo" quick action is "disabled"
    And I see the "redo" quick action is "enabled"

  Scenario: The last panel left open cannot be toggled away
    Then I see the "SourceEditor" panel toggle is "enabled"

    When I toggle the "ItemsList" panel
    And I toggle the "ThreeDEditorFullscreen" panel
    Then I see the "SourceEditor" panel toggle is "disabled"
    And I see the "ItemsList" panel toggle is "enabled"

    When I toggle the "ItemsList" panel
    Then I see the "SourceEditor" panel toggle is "enabled"

  Scenario: Browsing the list is not something to undo
    When I clone material at index "1"
    Then I see the "undo" quick action is "enabled"

    # Selecting rows moves focus through their name fields; neither the move nor the no-op rename
    # that follows the click-away is an edit, so browsing must not deepen the history. If it did,
    # the single undo below would walk back a selection and leave the clone in place.
    When I select material with index "2" from material designer items list
    And I select material with index "1" from material designer items list
    And I select material with index "2" from material designer items list

    When I click the "undo" quick action
    Then material with following data does not exist in state
      | path          | index   |
      | si-clone.json | $INT{2} |
    And I see the "undo" quick action is "disabled"
