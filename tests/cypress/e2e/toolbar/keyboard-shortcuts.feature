Feature: Keyboard shortcuts drive the app without stealing keys from text fields

  # A shortcut is a native keydown listener, which React does not batch. That path is exactly where
  # undo/redo was broken before: the state history moved after the re-render rather than before it,
  # so the outgoing state was published. These scenarios pin that down.

  Scenario: Undo and redo respond to the keyboard
    When I open materials designer page
    Then I see material designer page
    When I clone material at index "1"
    Then material with following data exists in state
      | path          | index   |
      | si-clone.json | $INT{2} |

    When I press "ctrl+z" outside any text field
    Then material with following data does not exist in state
      | path          | index   |
      | si-clone.json | $INT{2} |

    When I press "ctrl+shift+z" outside any text field
    Then material with following data exists in state
      | path          | index   |
      | si-clone.json | $INT{2} |

  Scenario: The same key inside a text field belongs to the field, not the app
    When I open materials designer page
    Then I see material designer page
    When I clone material at index "1"
    Then material with following data exists in state
      | path          | index   |
      | si-clone.json | $INT{2} |

    When I press "ctrl+z" inside the materials filter
    Then material with following data exists in state
      | path          | index   |
      | si-clone.json | $INT{2} |
