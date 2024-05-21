import path from 'path';
import assert from 'assert';
import jsxEngine from '../engine.js';
import { describe, it } from 'node:test';

const props = { name: 'JSXEngine' };
const extendedProps = {
    title: 'AppExpress-JSX',
    subtitle: 'React View Engine for AppExpress!',
    content: 'A view engine that supports JS, JSX and TSX views from React!',
    author: '@ItzNotABug',
};

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

describe(`React JSX engine plain test`, () => {
    ['js', 'jsx', 'tsx'].forEach((extension) => {
        const reactComponent = component(`react.${extension}`);

        it(`Rendering with markup (${extension.toUpperCase()})`, async () => {
            const staticExpected = `<div>Hello, this is the \`${props.name}\`</div>`;

            const html = await engine(reactComponent, props, true);
            assert.strictEqual(html, staticExpected);
        });

        it(`Rendering without markup (${extension.toUpperCase()})`, async () => {
            // `renderToString` adds extra comments.
            const stringExpected = `<div>Hello, this is the \`<!-- -->${props.name}<!-- -->\`</div>`;

            const html = await engine(reactComponent, props, false);
            assert.strictEqual(html, stringExpected);
        });
    });
});

describe(`React JSX engine partials test `, () => {
    ['jsx', 'tsx'].forEach((extension) => {
        const reactComponent = component(`article.${extension}`);
        const expected = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" /><meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>AppExpress-JSX</title></head><body><h1>AppExpress-JSX</h1><article><header><h3>React View Engine for AppExpress!</h3></header><section>A view engine that supports JS, JSX and TSX views from React!</section><footer><p>Written by: @ItzNotABug</p></footer></article></body></html>`;

        it(`Partials support with .${extension.toUpperCase()} extension`, async () => {
            const html = await engine(reactComponent, extendedProps, true);
            const cleanBody = html
                .replace(/\n/g, '')
                .replace(/ {2,}/g, '')
                .replace(/<([^>\s]+)([^>]*)\/>/g, '<$1$2 />');

            assert.strictEqual(cleanBody, expected);
        });
    });
});
