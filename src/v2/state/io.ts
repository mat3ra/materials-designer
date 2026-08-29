/**
 * File in, file out.
 *
 * Import records the file as an origin operation (payload + format), so a
 * material's provenance starts with "where it came from" rather than a bare
 * structure. Export is the only place a structure leaves as coordinates.
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
