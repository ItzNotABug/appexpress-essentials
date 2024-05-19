import React from 'react';
import { register } from 'node:module';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';

let staticMarkup = true;

export default {
    /**
     * Configures the rendering behavior of the JSX engine.
     *
     * @param {Object} opts - Configuration options for the rendering engine.
     * @param {boolean} opts.useStaticMarkup=true - If true, renders using `renderToStaticMarkup`, otherwise uses `renderToString`.
     */
    options: function ({ useStaticMarkup = true } = {}) {
        staticMarkup = useStaticMarkup;
    },

    /**
     * A rendering engine to render React components.
     *
     * @param {string} filePath - The path to the React component file.
     * @param {Object} options - Props to pass to the React component.
     * @param {function} callback - Callback function to return the result (error or HTML string).
     */
    engine: function (filePath, options, callback) {
        initBabelHook();

        try {
            import(filePath)
                .then((module) => module.default)
                .then((ReactComponent) => {
                    const renderMethod = !staticMarkup
                        ? renderToString
                        : renderToStaticMarkup;

                    let html = renderMethod(
                        React.createElement(ReactComponent, options),
                    );

                    if (html.startsWith('<html')) {
                        html = `<!DOCTYPE html>${html}`;
                    }

                    callback(null, html);
                });
        } catch (error) {
            callback(error);
        }
    },
};

/**
 * Set up babel for the action!
 */
function initBabelHook() {
    setLocalNodePathForBabel();
    register('./hook/babel.js', import.meta.url);
}

/**
 * Appwrite Functions are executed in the `usr/local/server` and babel
 * would look for the `node_modules` in that directory which includes
 * the runtime and `micro` server's dependencies and not the user function's.
 *
 * Fortunately, for some reason, this runtime hooks **works** on Appwrite!
 *
 * Note: If in the future this doesn't work, another possible way is to add
 * this as an environment variable from Functions Settings. Not a good DX I know.
 */
function setLocalNodePathForBabel() {
    // babel requires this to work properly for Appwrite Functions.
    process.env.NODE_PATH = '/usr/local/server/src/function/node_modules';
}
