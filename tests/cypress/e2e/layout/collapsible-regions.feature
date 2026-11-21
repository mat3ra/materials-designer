Feature: A region collapses from its own header

  # The affordance belongs on the thing it acts on. "Give me that space back" is a thought you
  # have while looking at a panel, not while looking at a toolbar — so the title is the button.
  #
  # Collapsed is not hidden, and the difference is the point: a hidden region is gone, a collapsed
  # one is a rail you can click. That is why collapsing every region is allowed where hiding every
  # region is refused.

  Background:
    When I size the window to 1600 by 900
    And I open materials designer page
    Then I see material designer page

  Scenario: The timeline collapses to a rail and comes back
    Then I see the "timeline" region is expanded
    And I see the "timeline" region is at least 200px wide

    When I collapse the "timeline" region from its header
    Then I see the "timeline" region is collapsed
    And I see the "timeline" region is at most 48px wide
    # Railed, not gone — the rail is what you click to bring it back.
    And I see the "[data-region='timeline']" panel

    When I expand the "timeline" region from its rail
    Then I see the "timeline" region is expanded
    And I see the "timeline" region is at least 200px wide

  Scenario: Collapsing gives the space to the 3D view
    When I collapse the "navigator" region from its header
    And I collapse the "inspector" region from its header
    Then I see the "viewport" region is at least 1200px wide

  Scenario: Every region may be collapsed at once, unlike hiding
    When I collapse the "navigator" region from its header
    And I collapse the "timeline" region from its header
    And I collapse the "inspector" region from its header
    Then I see the "navigator" region is collapsed
    And I see the "timeline" region is collapsed
    And I see the "inspector" region is collapsed
    # Still a usable app: three rails and the viewport.
    And I see the "viewport" region is at least 1200px wide
