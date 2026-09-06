@parity_2_0
Feature: Reviewing an upload is a decision, and cancelling is one too

  # `add-remove-import-files` covers the grid itself and runs against both applications. This adds
  # what only 2.0 promises: nothing enters the session until you say so, and the review can be
  # left without leaving anything behind.

  Background:
    When I open materials designer page
    Then I see material designer page
    Then I see 1 materials in the list

  Scenario: Files sit in the review until they are added
    When I open UploadDialog
    Then I see UploadDialog

    When I upload files
      | filename      |
      | graphene.json |
    Then I see the files with formats listed in the data grid
      | filename      | format |
      | graphene.json | json   |
    # Reviewed, not imported.
    And I see 1 materials in the list

    When I click the Submit button
    Then I see 2 materials in the list
    And the UploadDialog should be closed

  Scenario: Cancelling adds nothing
    When I open UploadDialog
    And I upload files
      | filename      |
      | graphene.json |
    And I cancel import
    Then the UploadDialog should be closed
    And I see 1 materials in the list
