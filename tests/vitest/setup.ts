import JSONSchemasInterface from "@mat3ra/esse/dist/js/esse/JSONSchemasInterface";
import allSchemas from "@mat3ra/esse/dist/js/schemas.json";

// `Material.toJSON` resolves its ESSE schema by id, so it fails outside an app that registered them.
// The standalone host does this in src/index.jsx; tests need the same bootstrap before any material.
JSONSchemasInterface.setSchemas(allSchemas);
