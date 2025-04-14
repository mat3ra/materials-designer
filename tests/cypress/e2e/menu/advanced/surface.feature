Feature: User can create a slab

  Scenario:
    When I open materials designer page
    And I create a surface with the following data:
      | h       | k       | l       | thickness | vacuumRatio | vx      | vy      |
      | $INT{1} | $INT{1} | $INT{1} | $INT{3}   | $FLOAT{0.5} | $INT{1} | $INT{1} |
    Then material with following data exists in state
      | path         | index   |
      | si-slab-111-0.5-vacuum-ratio.json | $INT{1} |
