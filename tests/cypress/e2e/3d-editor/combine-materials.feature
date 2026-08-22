Feature: User can combine multiple materials and create a new material

  Scenario:
    When I open materials designer page
    And I clone material at index "1"
    And I select material with index "2" from material designer items list
    And I set material basis and lattice with the following data:
      | basis    | lattice                                                  |
      | Cu 0 0 0 | {"type":"FCC", "a":2.560619, "b":2.560619, "c":2.560619} |
    And I set name of material with index "2" to "Copper"
    # TODO: figure out why abc are 1/2 of what they should be below and re-enable the step below
    # Then material with following data exists in state
    #   | path        | index   |
    #   | copper.json | $INT{2} |
    When I select material with index "1" from material designer items list
    And I create a surface with the following data:
      | h       | k       | l       | thickness | vacuumRatio | vx      | vy      |
      | $INT{1} | $INT{1} | $INT{1} | $INT{3}   | $FLOAT{0.5} | $INT{1} | $INT{1} |
    And I set name of material with index "1" to "Silicon FCC - slab [1,1,1]"
    Then material with following data exists in state
      | path         | index   |
      | si-slab.json | $INT{1} |

    # The slab is the active material, so it is the host and keeps its lattice; the copper is
    # placed into it at the cartesian offset below, in angstrom.
    When I open the combine materials dialog
    And I add the following materials to the combination:
      | index   | x           | y           | z           |
      | $INT{2} | $FLOAT{1.1} | $FLOAT{1.1} | $FLOAT{1.1} |
    And I name the combined material "Si-Slab-Cu"
    And I submit the combine materials dialog
    Then material with following data exists in state
      | path            | index   |
      | Si-Slab-Cu.json | $INT{3} |
