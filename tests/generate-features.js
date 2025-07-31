const path = require('path');
const glob = require('glob');
const { generateFeatureFilesFromConfig } = require("@mat3ra/tede");
const { Utils } = require("@mat3ra/utils/server");

function generateFeatures(inputDir, outputDir) {
    const yamlFiles = glob.sync(path.join(inputDir, "*.yaml"));
    const testConfigs = yamlFiles.map(yamlPath => Utils.yaml.readYAMLFile(yamlPath));

    testConfigs.forEach(testConfig => {
        try {
            generateFeatureFilesFromConfig(testConfig, inputDir, outputDir);
            console.log(`✅ Successfully generated features for: ${testConfig.template_path}`);
        } catch (error) {
            console.error(`❌ Failed to generate features for: ${testConfig.template_path}`);
            console.error(`Error: ${error.message}`);
            console.error(`Config:`, JSON.stringify(testConfig, null, 2));
        }
    });
}
inputDir = path.join(__dirname, "cypress/templates");
outputDir = path.join(__dirname, "cypress/e2e");
generateFeatures(inputDir, outputDir);
