@parity_2_0
Feature: The Console carries a Python REPL

  # The materials binding waits on cove's in-page REPL; what is here is a working Python console
  # and, more importantly, the guarantee that switching tabs does not leave two frames on the page.
  # Both console frames are addressed by id when posting, so a stale one would quietly receive the
  # messages meant for its replacement.

  Background:
    When I open materials designer page
    Then I see material designer page

  Scenario: Switching console tabs leaves exactly one frame mounted
    When I open the "repl" console tab
    Then I see the console frame "python-repl-iframe"
    And I do not see the console frame "jupyter-lite-iframe"

    When I open the "notebook" console tab
    Then I see the console frame "jupyter-lite-iframe"
    And I do not see the console frame "python-repl-iframe"
