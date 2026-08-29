Feature: A material is flagged as updated only while it differs from how it entered the session

  # README TODO: "switch the color back to white when the material is back to the original after
  # editing". The flag drives the marker on the list row.

  Scenario: Editing the basis flags the material, and putting it back clears the flag
    When I open materials designer page
    Then I see material designer page
    And material with index "1" is not marked as updated

    When I set material basis and lattice with the following data:
      | basis                              |
      | Si 0 0 0;Si 0.3 0.3 0.3            |
    Then material with index "1" is marked as updated

    # Byte-identical to the material the session opened with
    When I set material basis and lattice with the following data:
      | basis                                |
      | Si 0 0 0;Si 0.25 0.25 0.25           |
    Then material with index "1" is not marked as updated

  Scenario: A clone has no original to return to, so it stays flagged
    When I open materials designer page
    Then I see material designer page
    When I clone material at index "1"
    Then material with index "2" is marked as updated

    # Editing it and undoing that edit by hand must not make it look saved
    When I set material basis and lattice with the following data:
      | basis                              |
      | Si 0 0 0;Si 0.3 0.3 0.3            |
    And I set material basis and lattice with the following data:
      | basis                                |
      | Si 0 0 0;Si 0.25 0.25 0.25           |
    Then material with index "2" is marked as updated
