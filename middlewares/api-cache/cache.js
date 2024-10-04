// noinspection JSUnresolvedReference, JSUnusedGlobalSymbols

import * as memoryCache from './memory.js';

const CACHE_STATUS_HEADER_KEY = 'X-APPEXPRESS-API-CACHE';

const configOptions = {
    excludedPaths: [],
    cacheControl: true,
    expirationTime: 1000 * 60 * 5,
};

/**
 * Middleware that serves cached responses.
 *
 * **Note: The responses are cached in memory after the first request, up until the function container is removed.**
 *
 * @param {(string|RegExp)[]} [excludes=[]] - Paths to exclude.
 * Supports strings and regular expressions.
 * Caching won't be applied if a path matches any one in excluded paths.
 * @param {number} [timeout=300000] - Cache expiry in milliseconds. Default 5 minutes. Pass `0` for no expiry!
 * @param {boolean} [cacheControl=true] - Should add a `cache-control` header. Default true. This header is not overridden if one already exists.
 * @returns {{ hasCache: function, clearCache: function, clearAllCache: function }}
 */
export default function ({
    excludes = [],
    timeout = 300000,
    cacheControl = true,
} = {}) {
    configOptions.excludedPaths = excludes;
    configOptions.expirationTime = timeout;
    configOptions.cacheControl = cacheControl;

    return {
        /**
         * Check if a given URL has a cached response in memory.
         *
         * @param {string} url - The URL to check for a cache response.
         * @returns {boolean} True if a memory cache exists for the URL, false otherwise.
         */
        hasCache: (url) => !!memoryCache.get(url),

        /**
         * Clear cache for a given url.
         *
         * @param {string} url - The URL for which to remove the cache.
         */
        clearCache: (url) => memoryCache.remove(url),

        /**
         * Clears all cached responses in the memory.
         */
        clearAllCache: () => memoryCache.clear(),

        // internal middleware methods.
        incoming: (request, response) => {
            serveCacheIfAvailable(request, response);
        },

        outgoing: (request, interceptor) => {
            saveCache(request, interceptor);
        },
    };
}

/**
 * Serve cache from memory if one exists.
 *
 * @param {Object} request - The `RequestHandler` object.
 * @param {Object} response - The `ResponseHandler` object.
 */
const serveCacheIfAvailable = (request, response) => {
    if (isPathExcluded(request)) {
        response.setHeaders({ CACHE_STATUS_HEADER_KEY: 'EXCLUDED' });
        return;
    }

    if (!isRequestValid(request)) {
        response.setHeaders({ CACHE_STATUS_HEADER_KEY: 'IGNORED' });
        return;
    }

    const entry = memoryCache.get(request.url);
    if (entry) {
        const { headers = {}, body = '', statusCode = 200 } = entry.value;
        if (!headers['cache-control'] && configOptions.cacheControl) {
            if (entry.isInfinite) {
                headers['cache-control'] = 'public, immutable';
            } else {
                const maxAge = Math.round(entry.timeout / 1000);
                headers['cache-control'] = `max-age=${maxAge}`;
            }
        }

        headers[CACHE_STATUS_HEADER_KEY] = 'HIT';

        response.setHeaders(headers);
        response.text(
            body,
            statusCode,
            headers['content-type'] ?? 'text/plain',
        );
    }
};

/**
 * Saves cache to memory if one doesn't exist.
 *
 * @param {Object} request - The `RequestHandler` object.
 * @param {Object} interceptor - The `ResponseInterceptor` object.
 */
const saveCache = (request, interceptor) => {
    const { headers = {} } = interceptor;

    if (isPathExcluded(request)) {
        headers[CACHE_STATUS_HEADER_KEY] = 'EXCLUDED';
        return;
    }

    if (!isRequestValid(request)) {
        headers[CACHE_STATUS_HEADER_KEY] = 'IGNORED';
        return;
    }

    const excludeCache = headers['apicache-exclude'] ?? false;
    if (excludeCache) {
        headers[CACHE_STATUS_HEADER_KEY] = 'EXCLUDED';
        return;
    }

    const customTime =
        headers['apicache-timeout'] ?? configOptions.expirationTime;
    const value = memoryCache.get(request.url);
    if (value) return;

    headers[CACHE_STATUS_HEADER_KEY] = 'MISS';
    memoryCache.add(customTime, request, interceptor);
};

/**
 * Check if a path is excluded from caching.
 *
 * @param {Object} request - The `RequestHandler` object.
 * @returns {boolean} True if path is in the exclude list, false otherwise.
 */
const isPathExcluded = (request) => {
    const excludes = configOptions.excludedPaths;
    return excludes.some((exclude) =>
        typeof exclude === 'string'
            ? exclude === request.path
            : exclude.test(request.path),
    );
};

/**
 * We shouldn't really cache the `PUT`, `POST` or `DELETE` method types.
 *
 * @param {Object} request - The `RequestHandler` object.
 * @returns {boolean} False if the request method is one of the above-mentioned, true otherwise.
 */
const isRequestValid = (request) => {
    const method = request.method;
    const methodsToExclude = ['put', 'post', 'delete'];
    return !methodsToExclude.includes(method);
};
