import _ from "underscore";

// TODO: use code.js and Array.isArray() for this
export function safeMakeArrayIfNot<T>(x: T | T[]): T[] {
    if (!_.isArray(x)) return [x];
    return x;
}
