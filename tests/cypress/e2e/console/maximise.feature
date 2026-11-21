Feature: The console can take the whole window

  # "Where to put JupyterLite — right vs left" is a false choice: JupyterLab ships its own file
  # browser plus a cell area and needs 700px+, which neither side column has. So the console stays
  # where it is and everything else gets out of the way.
  #
  # Maximising is a preset of the collapse state, never a move in the tree. That is not a detail:
  # relocating the dock would remount its frame and take a running kernel — and the user's work —
  # with it. The last scenario is what holds that promise in place.

  Background:
    When I size the window to 1280 by 900
    And I open materials designer page
    Then I see material designer page

  Scenario: Maximising rails everything else, and restoring puts it back
    When I open the "notebook" console tab
    Then I see the "inspector" region is expanded

    When I run the "console.maximise" command
    Then I see the "navigator" region is collapsed
    And I see the "timeline" region is collapsed
    And I see the "inspector" region is collapsed

    When I run the "console.maximise" command
    Then I see the "inspector" region is expanded
    And I see the "navigator" region is expanded

  Scenario: A region control while maximised restores the layout first
    When I open the "notebook" console tab
    And I run the "console.maximise" command
    Then I see the "navigator" region is collapsed

    # Otherwise the bar could un-hide the viewport under a console still calling itself maximised,
    # and the two states would drift apart with nothing telling the user which was real.
    When I collapse the "navigator" region from its header
    Then I see the "navigator" region is expanded

  Scenario: The frame survives being maximised, so a running kernel does
    When I open the "notebook" console tab
    And I mark the console frame
    And I run the "console.maximise" command
    Then I see the console frame is the same element
    When I run the "console.maximise" command
    Then I see the console frame is the same element
