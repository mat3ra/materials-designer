/**
 * `MDState`, kept where the platform expects to find it.
 *
 * v1 published its reducer state on `window.MDState` and web-app imports this type from
 * `dist/reducers/Material`. 2.0's state is an operation log, but the projection it publishes has
 * the same four fields, so the type is a re-export rather than a second declaration — one shape,
 * one place it is defined, and no way for the two to drift.
 *
 * The reducer functions this file used to hold went with v1. Nothing outside this repository
 * imported them.
 */
export type { MDStateView as MDState } from "../domain/mdState";
