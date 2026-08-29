Feature: The command palette searches actions, the session's materials and Standata

  Background:
    When I open materials designer page
    Then I see material designer page

  Scenario: Actions are listed and can be run from the palette
    When I open the command palette
    Then I see "Create supercell" in the command palette

    When I search the command palette for "surf"
    Then I see "Create surface / slab" in the command palette
    And I do not see "Create supercell" in the command palette

    When I search the command palette for "standata"
    And I run "Import from Standata" from the command palette
    Then I see Standata dialog

  Scenario: Materials in the session are reachable by name
    When I clone material at index "1"
    And I set name of material with index "2" to "Findable Copy"
    And I open the command palette
    And I search the command palette for "Findable"
    Then I see "Findable Copy" in the command palette

  Scenario: Standata is searched only once a query is typed
    When I open the command palette
    # 73 Standata entries would otherwise bury the dozen actions
    Then I do not see "Graphene" in the command palette

    When I search the command palette for "graphene"
    Then I see "Graphene" in the command palette

  Scenario: A Standata entry actually imports the material it names
    # Regression guard: the palette's import handler constructs an MDMaterial, and the import for
    # it was commented out in HeaderMenuToolbar - so running this entry threw a ReferenceError.
    # The earlier scenarios only assert that Standata rows are *visible*, never that one works.
    When I open the command palette
    And I search the command palette for "graphene"
    And I run "Graphene" from the command palette
    Then I see "2" materials in the list
