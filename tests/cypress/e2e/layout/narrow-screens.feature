Feature: The layout still works on a small screen

  # 804px of fixed side chrome (252 + 236 + 316) against a 1280px laptop left the 3D view under
  # 470px, and nothing in the stylesheet noticed. Two rules fix it: the side regions start railed
  # when the window is small, and below 1000px only one of them may be open at a time.

  Scenario: A narrow window opens with the side regions railed
    When I size the window to 1024 by 768
    And I open materials designer page
    Then I see material designer page
    And I see the "timeline" region is collapsed
    And I see the "inspector" region is collapsed
    # The point of the app is the material; it gets the room.
    And I see the "viewport" region is at least 600px wide

  Scenario: Below 1000px only one side panel is open at a time
    When I size the window to 960 by 768
    And I open materials designer page
    Then I see material designer page

    When I expand the "inspector" region from its rail
    Then I see the "inspector" region is expanded
    # Opening one rails the others rather than sharing out what is not there.
    And I see the "navigator" region is collapsed
    And I see the "timeline" region is collapsed

    When I expand the "navigator" region from its rail
    Then I see the "navigator" region is expanded
    And I see the "inspector" region is collapsed

  Scenario: A wide window opens with everything expanded
    When I size the window to 1920 by 1080
    And I open materials designer page
    Then I see material designer page
    And I see the "navigator" region is expanded
    And I see the "timeline" region is expanded
    And I see the "inspector" region is expanded
    And I see the "viewport" region is at least 1000px wide
