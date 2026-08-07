@ignore
Feature: Python REPL is fast enough to use

  Scenario: The environment installs and the first run is immediate
    Given I open materials designer page
    When I open the Python REPL
    Then the Python REPL becomes ready within the install budget
    When I run the Python REPL code
    Then the first run completes immediately
