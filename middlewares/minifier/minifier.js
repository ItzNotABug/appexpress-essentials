import { minify as htmlMinifier } from 'html-minifier-terser';

const configOptions = { excludedPaths: [], htmlMinifierOptions: {} };

/**
 * Middleware that minifies content.
 *
 * @param {(string|RegExp)[]} [excludes=[]] - Paths to exclude.
 * Supports strings and regular expressions.
 * Minification won't be applied if a path matches any one in excluded paths.
 * @param {Object} [htmlOptions={}] - HTML minifier options.
 */
export default function ({ excludes = [], htmlOptions = {} } = {}) {
    configOptions.excludedPaths = excludes;
    configOptions.htmlMinifierOptions = htmlOptions;

    return {
        outgoing: async (request, interceptor, _, error) => {
            try {
                await checkAndMinify(request, interceptor);
            } catch (err) {
                error(`Unable to minify the content, ${err.message}`);
            }
        },
    };
}

/**
 * Check for excluded paths and minify the content if required.
 *
 * @param {Object} request - The `RequestHandler` object.
 * @param {Object} interceptor - The `ResponseInterceptor` object.
 */
const checkAndMinify = async (request, interceptor) => {
    const excludes = configOptions.excludedPaths;
    const isExcluded = excludes.some((exclude) =>
        typeof exclude === 'string'
            ? exclude === request.path
            : exclude.test(request.path),
    );

    if (isExcluded) return;

    const { body, headers = {} } = interceptor;

    // return if the content is marked for exclusion.
    let excludeMinify = headers['exclude-minify'];
    if (excludeMinify) {
        // only numbers and strings allowed currently,
        // should be addressed in the next release ig.
        excludeMinify = excludeMinify?.toString().toLowerCase() === 'true';
    } else excludeMinify = false;

    if (excludeMinify) return;

    const isBuffer = Buffer.isBuffer(body);
    if (isBuffer) return;

    const contentType = headers['content-type'] ?? '';
    if (
        isJsonString(body) ||
        typeof body === 'string' ||
        contentType.startsWith('text/') ||
        contentType === 'application/xml' ||
        contentType === 'application/json'
    ) {
        await minify(interceptor);
    }
};

/**
 * Checks if the given string is a valid JSON format.
 *
 * @param {string} content - Content to check.
 * @return {boolean} True if valid `JSON`, false otherwise.
 */
const isJsonString = (content) => {
    try {
        JSON.parse(content);
    } catch (error) {
        return false;
    }

    return true;
};

/**
 * Minifies the given content.
 *
 * @param {Object} interceptor - Content to minify in the `ResponseInterceptor` object.
 */
const minify = async (interceptor) => {
    let content = interceptor.body;
    const isXml = content.includes('<xml');
    const isHtml = content.includes('<html');

    if (isJsonString(content)) {
        try {
            content = JSON.stringify(JSON.parse(content));
            interceptor.body = content.trim();
            return;
        } catch (error) {
            return;
        }
    }

    if (isHtml) {
        content = await htmlMinifier(
            content,
            configOptions.htmlMinifierOptions,
        );
    } else {
        if (isXml) {
            content = content.replace(/>([^<]+)</g, (match, key) => {
                return '>' + key.replace(/\s+/g, ' ').trim() + '<';
            });
        } else {
            content = content.replace(/\s+/g, ' ');
        }
    }

    interceptor.body = content.trim();
};
