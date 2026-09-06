@parity_2_0
Feature: Files can be dropped anywhere on the window

  # The Catalog and the app menu both open the review; a drop is the shortcut, because the drop is
  # itself the decision. The overlay that appears while a drag is in flight has to go away when the
  # drag leaves — a full-screen overlay with no way back is worse than no overlay at all, and this
  # is the guard for it.

  Background:
    When I open materials designer page
    Then I see material designer page

  Scenario: The drop overlay appears while dragging and leaves with the drag
    When I drag files over the window
    Then I see the drop overlay

    When I drag away from the window
    Then I do not see the drop overlay

  Scenario: Dropping a file imports it without a review
    When I drop the file "graphene.json" on the window
    Then I see 2 materials in the list
    And I see timeline step 1 reports "graphene.json"
