/**
 * Creates deep clone of the object.
 * `lodash` appears to be the fastest: http://jsben.ch/bWfk9
 */
export function deepClone<T>(obj: T): T {
    //    return lodash.cloneDeep(obj);
    return JSON.parse(JSON.stringify(obj));
}
