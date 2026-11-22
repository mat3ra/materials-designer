/**
 * `mixwith` ships no type declarations, and there is no `@types/mixwith`.
 *
 * Only the `mix(Base).with(...)` form this app uses is described, and it deliberately returns
 * `unknown`: the members a mixin contributes are invisible to TypeScript unless every mixin is
 * re-declared here. The one call site asserts the shape it needs instead, which keeps the
 * guesswork in one visible place rather than spread through a declaration file nobody reads.
 */
declare module "mixwith" {
    export function mix(superclass: unknown): { with(...mixins: unknown[]): unknown };
}
