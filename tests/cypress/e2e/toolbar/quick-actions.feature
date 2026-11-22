Feature: The quick-action row reaches common operations in one click

  Background:
    When I open materials designer page
    Then I see material designer page

  Scenario: Panel toggles hide and restore the editor panels
    Then I see the ".materials-designer-source-editor" panel

    When I toggle the "SourceEditor" panel
    Then I do not see the ".materials-designer-source-editor" panel

    When I toggle the "SourceEditor" panel
    Then I see the ".materials-designer-source-editor" panel

  Scenario: An action on the row opens the same dialog as the menu
    When I click the "import-standata" quick action
    Then I see Standata dialog

  Scenario: Undo on the row steps the history back
    When I clone material at index "1"
    Then material with following data exists in state
      | path          | index   |
      | si-clone.json | $INT{2} |

    When I click the "undo" quick action
    Then material with following data does not exist in state
      | path          | index   |
      | si-clone.json | $INT{2} |
