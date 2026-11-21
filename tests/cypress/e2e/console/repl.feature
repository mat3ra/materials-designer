Feature: The Console carries a Python REPL

  # JupyterLite's /repl app over the same materials bridge as the notebook. The kernel is real and
  # runs remotely, so what these pin is the designer's side of it: the frames never overlap, and
  # what the REPL sends back is staged and adopted exactly as a notebook's output is.
  #
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

  Scenario: What the REPL produces is staged and adopted, as a notebook's output is
    When I open the "repl" console tab
    Then I see the console frame "python-repl-iframe"
    And I see 1 material selected in MaterialsSelector

    # The step speaks the bridge protocol at the app the way the frame would; the REPL frame is
    # the only bridge mounted, so it is the one that answers.
    When the notebook produces materials
      | name      |
      | REPL Made |
    Then I see 1 material staged in the output selector

    # The frame is the kernel. Adopting a result must not cost the user the session they are
    # working in, so the dock stays open and the element is the one that was already there —
    # the notebook closes on adopt, deliberately, and the scenario there pins the opposite.
    When I mark the console frame
    And I add what the console produced to the session
    Then material with following name exists in state
      | name      | index |
      | REPL Made | 2     |
    And I see material "REPL Made" at the top level of the list
    And I see the console frame "python-repl-iframe"
    And I see the console frame is the same element
