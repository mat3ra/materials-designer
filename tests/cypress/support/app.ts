/**
 * Which application the suite is driving.
 *
 * While MD 2.0 is built beside v1 the same step definitions serve both, so the widgets need to know
 * which DOM they are addressing. `--env APP=v2` selects 2.0 at /v2.html; the default stays v1 at /,
 * so every existing spec runs exactly as before.
 *
 * This whole file disappears at the flip, when v1 is deleted and /v2.html becomes /.
 */
export function isV2(): boolean {
    return Cypress.env("APP") === "v2";
}

export function appPath(): string {
    return isV2() ? "/v2.html" : "/";
}

/** Pick between a v1 and a 2.0 selector. */
export function forApp<T>(v1: T, v2: T): T {
    return isV2() ? v2 : v1;
}
