# Feature Test Generator

This tool generates Gherkin feature files from YAML templates for automated testing. It provides a structured way to create multiple test scenarios while maintaining consistent formatting and patterns.

## How to use

1. **Template Configuration (YAML)**
   Each YAML file defines:
    - A template file to use
    - Schema validation rules
    - Test cases with variables
    - Output path for generated features

2. **Template Files**
    - *.ftl files
    - Use `${variable}` syntax for dynamic content
    - Support table generation with `${array_table}` syntax
    - Maintain consistent Gherkin formatting

3. **Test Case Structure**
   Test cases in YAML files should include:
    - `feature_name`: Name of the generated feature file
    - Required fields as defined in templateSchema
    - Arrays of data for table generation

4. **Generate Feature Files**

   ```
   cd tests
   node generate-features.js
   ```

5. **Output**
   - Feature files are generated in `tests/cypress/e2e/health_checks` directory
   - Each feature file contains multiple scenarios based on test cases

6. **Notes**
    - `@healthcheck` tag is added to all features to run selectively on GHA
    - Tags like `@ignore` might be added to generated features to avoid running them (will be overwritten upon tests generation)
