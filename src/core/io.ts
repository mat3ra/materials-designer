/**
 * Structures in, structures out.
 *
 * Import records the file as an origin operation (payload + format), so a
 * material's provenance starts with "where it came from" rather than a bare
 * structure. Export is the only place a structure leaves as coordinates. The
 * config guard below is the other half of the boundary: what arrives from
 * outside has to be something the session can actually hold.
 */
import Material from "@mat3ra/made/dist/js/Material";

export type ExportFormat = "json" | "poscar";

export function serializeMaterial(material: Material, format: ExportFormat): string {
    return format === "poscar"
        ? material.getAsPOSCAR()
        : JSON.stringify(material.toJSON(), null, 2);
}

/** Browser download via an object URL; revoked on the next tick. */
export function downloadFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function safeName(name: string, format: ExportFormat): string {
    const base = (name || "material").replace(/[^\w.-]+/g, "_");
    return format === "poscar" ? `${base}.poscar` : `${base}.json`;
}

export function exportMaterials(
    materials: { material: Material; name: string }[],
    format: ExportFormat,
): void {
    // One file per material: v1 did the same, and bundling needs a zip
    // dependency the MVP does not carry.
    materials.forEach(({ material, name }) =>
        downloadFile(serializeMaterial(material, format), safeName(name, format)),
    );
}

export interface ImportedFile {
    name: string;
    content: string;
}

export function readFiles(files: FileList | File[]): Promise<ImportedFile[]> {
    return Promise.all(
        Array.from(files).map(
            (file) =>
                new Promise<ImportedFile>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () =>
                        resolve({ name: file.name, content: String(reader.result) });
                    reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
                    reader.readAsText(file);
                }),
        ),
    );
}

/**
 * A config from outside, as the session can hold it.
 *
 * Structures taken from a database carry an `external` block saying where they came from, and the
 * enhanced schema constrains its `source` to a fixed list. One of the seventy-three standard-library
 * entries names a source outside that list, so it cannot be serialised — and everything downstream
 * serialises, starting with the 3D view, which clones the material on every prop change.
 *
 * The block is dropped only when it is the thing making the config unusable. An earlier version of
 * this dropped it from everything on the theory that made.js could never serialise it; that was
 * wrong, and it cost the other seventy-two entries the provenance the platform's specs assert on.
 * Anything still unusable without it is a broken structure, and the error is left to the caller,
 * which knows what to name in the message.
 */
export function toImportableConfig(config: Record<string, unknown>): Record<string, unknown> {
    try {
        new Material(config as never).toJSON();
        return config;
    } catch (error) {
        if (config.external === undefined) throw error;
        const { external, ...rest } = config;
        new Material(rest as never).toJSON();
        return rest;
    }
}
