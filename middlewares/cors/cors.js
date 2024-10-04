const configOptions = {
    origin: '*',
    excludedPaths: [],
    preflightContinue: false,
    optionsSuccessStatus: 204,

    /**
     * `head` is not supported at the moment!
     * @see: https://github.com/appwrite/appwrite/pull/8202
     *
     * TODO: Remove this jsdoc comment once the linked PR goes through!
     */
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
};

/**
 * Middleware that adds cors headers.
 *
 * @param {Object} options - Configuration options.
 * @param {string} [options.origin='*'] - Specifies which origin(s) may access the resource.
 *        Can be a single string (specific origin or '*') or an array of strings and `RegExp` for flexible matching.
 * @param {(string|RegExp)[]} [options.excludes=[]] - Paths to exclude from applying CORS.
 *        Supports strings and regular expressions. CORS headers won't be applied if a path
 *        matches any one in excluded paths.
 * @param {boolean} [options.preFlightContinue=false] - When false, an empty response is sent back.
 * @param {number} [options.optionsSuccessStatus=204] - The HTTP status code to use for successful
 *        preflight requests, typically 204 (No Content).
 * @param {string[]} [options.methods=['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']] - Specifies the
 *        methods allowed when accessing the resource. This is reflected in the 'Access-Control-Allow-Methods' header.
 */
export default function (options = {}) {
    const {
        origin = '*',
        excludes = [],
        preFlightContinue = false,
        optionsSuccessStatus = 204,
        methods = ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    } = options;

    configOptions.origin = origin;
    configOptions.excludedPaths = excludes;
    configOptions.preflightContinue = preFlightContinue;
    configOptions.optionsSuccessStatus = optionsSuccessStatus;
    configOptions.methods = methods.map((method) => method.toUpperCase());

    return {
        incoming: async (request, response, log, error) => {
            try {
                if (isPathExcluded(request)) return;
                applyCorsHeaders(request, response);
                handlePreflightRequest(request, response);
            } catch (err) {
                error(`Error applying CORS policy: ${err.message}`);
            }
        },
    };
}

/**
 * Check if a path is excluded for cors.
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
 * Applies CORS headers to the response.
 *
 * @param {Object} request - The `RequestHandler` object.
 * @param {Object} response - The `ResponseHandler` object.
 */
function applyCorsHeaders(request, response) {
    const headers = {
        ...configureOrigin(request),
        ...configureMethods(),
        ...configureAllowedHeaders(request),
    };

    // noinspection JSUnresolvedReference
    response.setHeaders(headers);
}

/**
 * Handles preflight (OPTIONS) requests specifically.
 *
 * @param {Object} request - The `RequestHandler` object.
 * @param {Object} response - The `ResponseHandler` object.
 */
function handlePreflightRequest(request, response) {
    if (
        request.method.toUpperCase() === 'OPTIONS' &&
        configOptions.preflightContinue === false
    ) {
        response.text('', configOptions.optionsSuccessStatus);
    }
}

/**
 * Determines whether the origin is allowed under the current configuration.
 *
 * @param {string|Array} origin - The origin to check against
 * @returns {boolean} True if origin is allowed, false otherwise.
 */
function isOriginAllowed(origin) {
    const allowedOrigin = configOptions.origin;
    if (Array.isArray(allowedOrigin)) {
        return allowedOrigin.includes(origin);
    } else if (typeof allowedOrigin === 'string') {
        return origin === allowedOrigin;
    } else if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
    }
    return false;
}

/**
 * Configures 'Access-Control-Allow-Origin' headers based on request origin and configuration.
 *
 * @param {Object} request - The `RequestHandler` object.
 * @returns {Object} The headers for the CORS policy.
 */
function configureOrigin(request) {
    const headers = {};
    const requestOrigin = request.headers['origin'];

    if (configOptions.origin === '*') {
        headers['Access-Control-Allow-Origin'] = '*';
    } else if (isOriginAllowed(requestOrigin)) {
        headers['Access-Control-Allow-Origin'] = requestOrigin;
        if (headers['Vary']) {
            headers['Vary'] += ', Origin';
        } else {
            headers['Vary'] = 'Origin';
        }
    }

    return headers;
}

/**
 * Configures 'Access-Control-Allow-Methods' headers.
 *
 * @returns {Object} The method headers for the CORS policy.
 */
function configureMethods() {
    return {
        'Access-Control-Allow-Methods': configOptions.methods.join(','),
    };
}

/**
 * Configures 'Access-Control-Allow-Headers' based on request.
 *
 * @param {Object} request - The `RequestHandler` object.
 * @returns {Object} The headers configured for 'Access-Control-Allow-Headers'.
 */
function configureAllowedHeaders(request) {
    const headers = {};
    const requestedHeaders = request.headers['access-control-request-headers'];
    const allowedHeaders = configOptions.headers || requestedHeaders;

    if (allowedHeaders) {
        headers['Access-Control-Allow-Headers'] = Array.isArray(allowedHeaders)
            ? allowedHeaders.join(',')
            : allowedHeaders;
    }

    if (!configOptions.headers && requestedHeaders) {
        headers['Vary'] = 'Access-Control-Request-Headers';
    }

    return headers;
}
