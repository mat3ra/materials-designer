@parity_2_0
Feature: A refresh does not lose the session

  # v1 kept the session in memory only, so a reload started over. 2.0 autosaves the operation log
  # and says so on the way back in — restoring silently would be worse than not restoring at all.

  Scenario: Work survives a reload, and the app says it was restored
    When I open materials designer page
    Then I see material designer page

    When I open the "supercell" operation panel
    And I set the supercell matrix diagonal to "2"
    And I apply the "supercell" operation panel
    Then I see the active material has 16 atoms
    And I see the saved session has 2 steps

    When I reload the page
    Then I see the restore notice
    And I see the active material has 16 atoms
    And I see the timeline has 2 steps

    When I keep the restored session
    Then I see the active material has 16 atoms

  Scenario: Starting fresh discards what was restored
    When I open materials designer page
    Then I see material designer page

    When I open the "supercell" operation panel
    And I set the supercell matrix diagonal to "2"
    And I apply the "supercell" operation panel
    And I see the saved session has 2 steps
    And I reload the page
    Then I see the restore notice

    When I start a fresh session
    Then I see the active material has 2 atoms
    And I see the timeline has 1 step
