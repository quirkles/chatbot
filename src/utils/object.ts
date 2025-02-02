
/**
 * Deeply merges two objects of the same type.
 *
 * @param {Object|Array} target The target object or array to merge into.
 * @param {Object|Array} source The source object or array to merge from.
 * @returns {Object|Array} The merged object or array.
 */
export function deepMerge<T>(target: T, source: T): T {
  // If the source is not an object or array, return the target
  if (typeof source !== "object") {
    return target;
  }

  // If the target is an array and the source is an array, merge them
  if (Array.isArray(target) && Array.isArray(source)) {
    return [...target, ...source] as T;
  }

  // If the target is an object and the source is an object, merge them recursively
  if (typeof target === "object" && typeof source === "object") {
    if (target === null) {
      if (source === null) {
        return null as T;
      }
      return source;
    }
    if (source === null) {
      return target;
    }
    for (const key in source) {
      // If the key is not in the target object, add it
      if (!(key in target)) {
        target[key] = source[key];
      } else {
        // If the key is an object in both the target and source, merge them recursively
        if (
          typeof target[key] === "object" &&
          typeof source[key] === "object"
        ) {
          target[key] = deepMerge(target[key], source[key]);
        } else {
          // Otherwise, overwrite the key in the target object with the value from the source object
          target[key] = source[key];
        }
      }
    }
  }

  // Return the merged object or array
  return target;
}
