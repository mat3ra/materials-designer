Feature: User can delete a material from the items list

  Scenario: Delete a material that is not selected
    Given I open materials designer page
    When I clone material at index "1"
    And I clone material at index "1"
    And I select material with index "2" from material designer items list
    And I set name of material with index "2" to "Silicon-2"
    And I select material with index "3" from material designer items list
    And I set name of material with index "3" to "Silicon-3"
    And I select material with index "3" from material designer items list
    And I remove material with index "2" from material designer items list
    Then material with following data exists in state
        | path    | index   |
        | si.json | $INT{1} |
    And material with following name exists in state
        | name      | index   |
        | Silicon-3 | $INT{2} |
