const configOptions = { excludedPaths: [] };

/**
 * Middleware to remove cookies.
 *
 * @param {string} excludes=[] - Paths to exclude.
 * Cookies won't be removed if a path matches any one in excluded paths.
 */
export default function ({ excludes = [] } = {}) {
    configOptions.excludedPaths = excludes;

    return {
        incoming: (request) => checkAndDelete(request),
        outgoing: (request, interceptor) =>
            checkAndDelete(request, interceptor),
    };
}

/**
 * Check for excluded paths and delete the cookies if required.
 *
 * @param {Object} request - The `RequestHandler` object.
 * @param {Object} interceptor=null - The `ResponseInterceptor` object.
 */
const checkAndDelete = (request, interceptor = null) => {
    const excludes = configOptions.excludedPaths;
    const isExcluded = excludes.some((path) => path === request.path);
    if (!isExcluded) {
        removeCookieHeaders(request.headers);
        if (interceptor) removeCookieHeaders(interceptor.headers);
    }
};

/**
 * Remove headers containing 'cookie' from the provided headers object.
 *
 * @param {Object} headers - The headers object to modify.
 */
const removeCookieHeaders = (headers) => {
    Object.keys(headers).forEach((header) => {
        if (header.toLowerCase().includes('cookie')) delete headers[header];
    });
};
