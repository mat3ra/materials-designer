Feature: The status bar describes the active material and where it sits in the list

  Scenario: Status bar reports the material and its position, and follows the selection
    When I open materials designer page
    Then I see material designer page
    And I see status bar showing
      | group     | text              |
      | material  | Si                |
      | material  | 2 atoms           |
      | material  | FCC               |
      | position  | 1 / 1             |
      | selection | No atoms selected |

    # Cloning appends without switching to the copy: the denominator grows, the numerator does not
    When I clone material at index "1"
    Then I see status bar showing
      | group    | text  |
      | position | 1 / 2 |

    # Selecting the copy moves the numerator
    When I select material with index "2" from material designer items list
    Then I see status bar showing
      | group    | text  |
      | position | 2 / 2 |

    When I select material with index "1" from material designer items list
    Then I see status bar showing
      | group    | text  |
      | position | 1 / 2 |
