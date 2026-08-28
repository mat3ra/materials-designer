Feature: Python REPL synchronizes generated materials

  # @ignore until a shared pyodide-repl deploy exists for CI to embed; runs locally against a
  # `vite preview` of that repo — see README section 3.7.
  @ignore
  Scenario: Generate a supercell in the Python REPL
    Given I open materials designer page
    When I open the Python REPL
    Then the Python REPL becomes ready
    When I run the Python REPL code
    Then the Python REPL adds a scoped material
    And the derived material does not inherit the source material id
    When I select material with index "2" from material designer items list
    And I run the Python REPL code
    Then the Python REPL replaces its scoped material
    And the selected material survives the sync
