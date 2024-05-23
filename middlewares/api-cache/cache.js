// noinspection JSUnresolvedReference

import * as memoryCache from './memory.js';

const CACHE_STATUS_HEADER_KEY = 'X-APPEXPRESS-API-CACHE';

const configOptions = {
    excludedPaths: [],
    cacheControl: true,
    expirationTime: 1000 * 60 * 5,
};

export default {
    /**
     * Sets options for the middleware.
     *
     * @param {Object} options - Configuration options.
     * @param {(string|RegExp)[]} [options.excludes=[]] - Paths to exclude.
     * Supports strings and regular expressions.
     * Caching won't be applied if a path matches any one in excluded paths.
     * @param {number} [options.timeout=300000] - Cache expiry in milliseconds. Default 5 minutes. Pass `0` for no expiry!
     * @param {boolean} [options.cacheControl=true] - Should add a `cache-control` header. Default true. This header is not overridden if one already exists.
     */
    options: ({ excludes = [], timeout = 300000, cacheControl = true }) => {
        configOptions.excludedPaths = excludes;
        configOptions.expirationTime = timeout;
        configOptions.cacheControl = cacheControl;
    },

    /**
     * Middleware that serves cached responses.
     *
     * **Note: The responses are cached in memory after the first request, up until the function container is removed.**
     */
    middleware: {
        incoming: (request, response) => {
            serveCacheIfAvailable(request, response);
        },
        outgoing: (request, interceptor) => {
            saveCache(request, interceptor);
        },
    },

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
     * @param {string} url - The URL for which to remove the cache
     */
    clearCache: (url) => memoryCache.remove(url),

    /**
     * Clears all cached responses in the memory.
     */
    clearAllCache: () => memoryCache.clear(),
};

/**
 * Serve cache from memory if one exists.
 *
 * @param {Object} request - The `RequestHandler` object.
 * @param {Object} response - The `ResponseHandler` object.
 */
const serveCacheIfAvailable = (request, response) => {
    if (isPathExcluded(request)) return;

    const entry = memoryCache.get(request.url);
    if (entry) {
        const { headers = {}, body = '', statusCode = 200 } = entry.value;
        if (!headers['cache-control'] && configOptions.cacheControl) {
            if (entry.isInfinite) {
                headers['cache-control'] = 'public, immutable';
            } else {
                const maxAge = Math.round(configOptions.expirationTime / 1000);
                headers['cache-control'] = `max-age=${maxAge}`;
            }
        }

        headers[CACHE_STATUS_HEADER_KEY] = 'HIT';

        response.setHeaders(headers);
        response.send(
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
