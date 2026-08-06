Feature: Python REPL synchronizes generated materials

  Scenario: Generate a supercell in the Python REPL
    Given I open materials designer page
    When I open the Python REPL
    Then the Python REPL becomes ready
    When I run the Python REPL code
    Then the Python REPL adds a scoped material
