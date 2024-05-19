import path from 'path';
import assert from 'assert';
import jsxEngine from '../engine.js';
import { describe, it } from 'node:test';

const props = { name: 'JSXEngine' };

const component = (file) => path.join(process.cwd(), `./views/${file}`);

/**
 * Executes the jsx view engine using a Promise, rendering HTML based on JSX templates.
 *
 * @param {string} componentPath - The file path to the React component.
 * @param {Object} props - Properties to pass to the React component during rendering.
 * @param {boolean} useStaticMarkup - If `true` uses `renderToStaticMarkup`, else `renderToString`.
 * @returns {Promise<string>} A promise that resolves with the rendered HTML string or rejects with an error.
 */
const engine = (componentPath, props, useStaticMarkup) => {
    jsxEngine.options({ useStaticMarkup });
    return new Promise((resolve, reject) => {
        jsxEngine.engine(componentPath, props, (error, html) => {
            if (error) reject(error);
            else resolve(html);
        });
    });
};

['js', 'jsx', 'tsx'].forEach((extension) => {
    describe(`React JSX Engine with .${extension.toUpperCase()} extension`, () => {
        const reactComponent = component(`react.${extension}`);

        it('React rendering with static markup', async () => {
            const staticExpected = `<div>Hello, this is the \`${props.name}\`</div>`;

            const html = await engine(reactComponent, props, true);
            assert.strictEqual(html, staticExpected);
        });

        it('React rendering without static markup', async () => {
            // `renderToString` adds extra comments.
            const stringExpected = `<div>Hello, this is the \`<!-- -->${props.name}<!-- -->\`</div>`;

            const html = await engine(reactComponent, props, false);
            assert.strictEqual(html, stringExpected);
        });
    });
});
