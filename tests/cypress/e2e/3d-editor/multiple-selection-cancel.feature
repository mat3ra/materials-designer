@quarantine
# Quarantined: this spec drives the Outliner panel (the multi-material scene-tree sidebar),
# which wave.js removed by design in its 2026-07-12 interactive-editor rewrite (commit 751a7e3) -
# see wave.js's docs/design/interactive-editor-spec.md, which lists "outliner/scene tree" under
# "Explicitly out of scope (dropped with the old editor, deliberately)". There is no renamed
# selector to update: the feature itself no longer exists in wave.js.
#
# Fails as:
#   AssertionError: Timed out retrying after 4000ms: Expected to find element:
#   `//div[@id="outliner"] //div[contains(@class,"option") and text() = " supercell"]
#   //span[contains(@class,"opener")]`
#
# Un-quarantine once materials-designer either re-pins wave.js to before the removal, or adopts
# the new click-to-select-in-viewport interaction as a deliberate replacement for this workflow.
Feature: User can cancel active multiple selection and all changes should be reverted

  Scenario:
    When I open materials designer page
    And I create materials with the following data
      | name      | basis                      |
      | supercell | Si 0 0 0;Si 0.25 0.25 0.25 |
    And I open multi-material 3D editor

    # set default positions for easier expectations calculations
    And I toggle scene object "supercell" opener inside 3D editor
    And I toggle scene object "Atoms" opener inside 3D editor
    And I select scene object "Si-0" inside 3D editor
    And I set position of scene object with the following data:
      | x    | y    | z    |
      | -1.0 | -1.0 | -1.0 |
    And I select scene object "Si-1" inside 3D editor
    And I set position of scene object with the following data:
      | x   | y   | z   |
      | 1.0 | 1.0 | 1.0 |

    # select atoms and move them a bit
    And I click on "Toggle Multiple Selection" toolbar button
    And I make multiple-selection with the following coordinates:
      | x1           | y1           | x2          | y2          |
      | $FLOAT{-0.5} | $FLOAT{-0.5} | $FLOAT{0.5} | $FLOAT{0.5} |
    And I set position of scene object with the following data:
      | x   | y   | z   |
      | 1.0 | 1.0 | 1.0 |

    # cancel multiple selection
    And I click on "Cancel Multiple Selection" toolbar button

    # expect that atoms have initial positions and weren't changed
    And I select scene object "Si-0" inside 3D editor
    Then I see that scene object has the following position:
      | x            | y            | z            |
      | $FLOAT{-1.0} | $FLOAT{-1.0} | $FLOAT{-1.0} |
    And I select scene object "Si-1" inside 3D editor
    Then I see that scene object has the following position:
      | x           | y           | z           |
      | $FLOAT{1.0} | $FLOAT{1.0} | $FLOAT{1.0} |
