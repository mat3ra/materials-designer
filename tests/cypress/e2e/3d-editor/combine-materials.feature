Feature: User can combine multiple materials and create a new material

  Scenario:
    When I open materials designer page
    And I clone material at index "1"
    And I select material with index "2" from material designer items list
    And I set material basis and lattice with the following data:
      | basis    | lattice                                                  |
      | Cu 0 0 0 | {"type":"FCC", "a":2.560619, "b":2.560619, "c":2.560619} |
    And I set name of material with index "2" to "Copper"
    Then material with following data exists in state
      | path        | index   |
      | copper.json | $INT{2} |
    When I select material with index "1" from material designer items list
    And I create a surface with the following data:
      | h       | k       | l       | thickness | vacuumRatio | vx      | vy      |
      | $INT{1} | $INT{1} | $INT{1} | $INT{3}   | $FLOAT{0.5} | $INT{1} | $INT{1} |
    And I set name of material with index "1" to "Silicon FCC - slab [1,1,1]"
    Then material with following data exists in state
      | path         | index   |
      | si-slab.json | $INT{1} |
    When I open multi-material 3D editor
    And I select scene object "Copper" inside 3D editor
    And I set position of scene object with the following data:
      | x   | y   | z   |
      | 1.1 | 1.1 | 1.1 |
    When I exit multi-material 3D editor
    And I set name of material with index "3" to "Si-Slab-Cu"
    Then material with following data exists in state
      | path            | index   |
      | Si-Slab-Cu.json | $INT{3} |
