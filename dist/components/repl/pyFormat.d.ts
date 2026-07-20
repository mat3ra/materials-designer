/**
 * Collapse fully-qualified dotted names to their last segment so long typed signatures read well —
 * e.g. `mat3ra.made.material.Material` → `Material`, and
 * `Union[a.b.Material, c.d.MaterialWithBuildMetadata]` → `Union[Material, MaterialWithBuildMetadata]`.
 *
 * Only runs of identifier segments are collapsed (each must start with a letter/underscore), so
 * numeric literals like `10.0` and generics like `Tuple[int, int, int]` are left untouched.
 */
export declare function shortenQualifiedNames(text: string): string;
