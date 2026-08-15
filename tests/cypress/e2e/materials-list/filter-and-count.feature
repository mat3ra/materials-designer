Feature: The materials list can be counted, filtered and added to

  Background:
    When I open materials designer page
    Then I see material designer page
    When I create materials with the following data
      | name     | basis                          | lattice                                                 |
      | Silicon  | Si 0 0 0                       | {"type":"FCC", "a":3.867, "b":3.867, "c":3.867}          |
      | Graphene | C 0 0 0; C 0.33 0.33 0         | {"type":"HEX", "a":2.467, "b":2.467, "c":20}             |
      | Copper   | Cu 0 0 0                       | {"type":"FCC", "a":2.560619,"b":2.560619,"c":2.560619}   |

  Scenario: The count reflects the list, and the filter narrows it by name
    Then I see the materials count showing "3"
    And I see "3" materials in the list

    When I filter the materials list by "graph"
    Then I see "1" materials in the list
    And I see the materials count showing "1 / 3"

    When I clear the materials list filter
    Then I see "3" materials in the list

  Scenario: A filter matching nothing explains itself
    When I filter the materials list by "zzz-no-such-material"
    Then I see "0" materials in the list
    And I see the empty state for the materials list

  Scenario: Filtering does not disturb which material an action applies to
    # Rows keep their real index while filtered, so renaming the only visible row must
    # rename that material and not the one that happens to sit first in the list.
    When I filter the materials list by "Copper"
    And I set name of material with index "1" to "Renamed While Filtered"
    And I clear the materials list filter
    Then material with following name exists in state
      | name                   | index   |
      | Renamed While Filtered | $INT{3} |

  Scenario: Removing a material can be undone, and it returns to its old position
    When I delete materials with index "2"
    Then I see "2" materials in the list
    When I undo the removal
    Then I see "3" materials in the list
    And material with following name exists in state
      | name     | index   |
      | Graphene | $INT{2} |

  Scenario: The add menu opens the Standata import dialog
    When I select "Import from Standata" from the add material menu
    Then I see Standata dialog
