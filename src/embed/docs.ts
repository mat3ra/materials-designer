/**
 * Turning the platform's materials into session documents.
 *
 * Kept apart from the container so it can be reasoned about — and tested — without a React tree:
 * this is the seam where the host's data model becomes ours, and it is worth being able to check
 * that in isolation.
 */
import { createMaterialDoc } from "../core/session";
import type { MaterialDoc } from "../core/types";
import type { MDMaterial } from "../MDMaterial";

/** A host material becomes an origin operation carrying its config. */
export function toMaterialDoc(material: MDMaterial): MaterialDoc {
    const config = material.toJSON() as unknown as Record<string, unknown>;
    const doc = createMaterialDoc("create-from-config", { config, source: "platform" });
    // The platform's own id travels with the document, so saving updates that record rather than
    // creating a duplicate.
    const externalId = (config as { _id?: string })._id;
    return externalId ? { ...doc, externalId } : doc;
}
