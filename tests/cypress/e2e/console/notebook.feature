Feature: The Console binds a JupyterLite notebook to the session

  Scenario: the notebook opens on the material the session is showing
    When I open materials designer page
    Then I see material designer page
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And the notebook frame is loaded from "made/Introduction.ipynb"
    And I see 1 material selected in MaterialsSelector

  Scenario: what a notebook produces is staged before it is adopted
    When I open materials designer page
    Then I see material designer page
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    When the notebook produces materials
      | name          |
      | Ni-C Interface |
    Then I see 1 material staged in the output selector
    And I see materials in output selector
      | name           | index |
      | Ni-C Interface | 1     |

    When I submit materials
    Then material with following name exists in state
      | name           | index |
      | Ni-C Interface | 2     |
    # A code result is not a fork of its input: it lands as a row of its own, not a child.
    And I see material "Ni-C Interface" at the top level of the list
    # v1 closed its dialog on submit and this keeps that, so re-opening starts a fresh notebook.
    # The REPL does the opposite on purpose — its frame is a live kernel — and its scenario pins
    # that, so the pair is deliberate rather than one of them being incidental.
    And I do not see the console frame "jupyter-lite-iframe"

  Scenario: a second run replaces what is staged instead of adding to it
    When I open materials designer page
    Then I see material designer page
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    When the notebook produces materials
      | name       |
      | First Run  |
      | Also First |
    Then I see 2 materials staged in the output selector

    When the notebook produces materials
      | name       |
      | Second Run |
    Then I see 1 material staged in the output selector

    When I submit materials
    Then material with following name exists in state
      | name       | index |
      | Second Run | 2     |
