/**
 * @typedef {Object} CacheEntry
 * @property {any} value - The cached data.
 * @property {number} timeout - Timeout identifier for the expiration.
 * @property {boolean} isInfinite - Whether this is an immutable response.
 */

/**
 * A cache object to store responses with expiration.
 * @type {Record<string, CacheEntry>}
 */
const memoryCache = {};

/**
 * Adds a new cache entry.
 *
 * @param {number} timeout - The cache timeout in milliseconds.
 * @param {Object} request - The request object containing the URL.
 * @param {Object} interceptor - The interceptor that processes the response.
 */
export const add = (timeout, request, interceptor) => {
    const key = request.url;
    const { body, headers, statusCode } = interceptor;

    memoryCache[key] = {
        isInfinite: timeout === 0,
        value: { body, headers, statusCode },
        timeout: timeout === 0 ? null : setTimeout(() => remove(key), timeout),
    };
};

/**
 * Removes a cache entry by key.
 *
 * @param {string} key - The key of the cache entry to remove.
 */
export const remove = (key) => {
    const entry = memoryCache[key];

    if (entry && entry.timeout) {
        clearTimeout(entry.timeout);
    }

    delete memoryCache[key];
};

/**
 * Retrieves a cache entry by key.
 *
 * @param {string} key - The key of the cache entry to retrieve.
 * @returns {Object} The cache entry, or undefined if it does not exist.
 */
export const get = (key) => {
    return memoryCache[key];
};

/**
 * Clears all cache entries.
 */
export const clear = () => {
    Object.keys(memoryCache).forEach((key) => remove(key));
};
