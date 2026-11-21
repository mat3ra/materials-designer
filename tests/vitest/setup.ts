/**
 * Material.toJSON()/clone() validate against ESSE schemas, which a host must
 * register first. The standalone app does this in src/index.jsx; tests need the
 * same bootstrap. (The web-app embed registers its own extended set.)
 */
import JSONSchemasInterface from "@mat3ra/esse/dist/js/esse/JSONSchemasInterface";
import allSchemas from "@mat3ra/esse/dist/js/schemas.json";

JSONSchemasInterface.setSchemas(allSchemas as never);
