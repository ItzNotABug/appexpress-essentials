import assert from 'assert';
import minifier from '../minifier.js';
import { describe, it } from 'node:test';

/**
 * html minifier options.
 */
const htmlMinifierOptions = {
    minifyJS: true,
    minifyCSS: true,
    removeComments: true,
    collapseWhitespace: true,
    preserveLineBreaks: false,
};

/**
 * create a pseudo-interceptor for tests.
 */
const createInterceptor = (content) => {
    return { body: content, headers: {} };
};

/**
 * run the minifier.
 */
const minify = async (interceptor, options = {}) => {
    const minifierModule = minifier({
        htmlOptions: {
            ...options,
            ...htmlMinifierOptions,
        },
    });
    await minifierModule.outgoing({}, interceptor, console.log, console.error);
};

describe(`Minification Test`, () => {
    it(`basic minification`, async () => {
        const expected =
            '<html lang="en"><body><h1>AppExpress Minifier</h1><p>AppExpress minifier enables minifying the content for faster transfers!</p></body></html>';
        const html = `
            <html lang="en">
                <body>
                    <h1>AppExpress Minifier</h1>
                    <p>AppExpress minifier enables minifying the content for faster transfers!</p>
                </body>
            </html>
        `;

        const interceptor = createInterceptor(html);
        await minify(interceptor);

        assert.strictEqual(interceptor.body, expected);
    });

    it(`basic minification with comments`, async () => {
        const expected =
            '<html lang="en"><body><h1>AppExpress Minifier</h1><p>AppExpress minifier enables minifying the content for faster transfers!</p></body></html>';
        const html = `
            <!-- this is a top level comment -->
            <html lang="en">
                <!-- this is a nested comment -->
                <body>
                    <!-- this is another nested comment -->
                    <h1>AppExpress Minifier</h1>
                    <p>AppExpress minifier enables minifying the content for faster transfers!</p>
                </body>
                <!-- this is a nested comment -->
            </html>
            <!-- this is a top level comment -->
        `;

        const interceptor = createInterceptor(html);

        await minify(interceptor);

        assert.strictEqual(interceptor.body, expected);
    });

    it(`basic minification with styles, scripts`, async () => {
        const expected = `<html lang="en"><head><title>AppExpress Minifier</title><script>console.log("hi there, this is a demo log")</script><style>h1{text-decoration:underline}p{font-style:italic;font-family:serif}</style></head><body><h1>AppExpress Minifier</h1><p>AppExpress minifier enables minifying the content for faster transfers!</p></body></html>`;
        const html = `
            <!-- this is a top level comment -->
            <html lang="en">
                <head>
                    <title>AppExpress Minifier</title>
                    <script>console.log('hi there, this is a demo log');</script>
                    <style>
                        h1 {
                            text-decoration: underline;
                        }

                        p {
                            font-style: italic;
                            font-family: serif;
                        }
                    </style>
                </head>

                <!-- this is a nested comment -->
                <body>
                    <!-- this is another nested comment -->
                    <h1>AppExpress Minifier</h1>
                    <p>AppExpress minifier enables minifying the content for faster transfers!</p>
                </body>
                <!-- this is a nested comment -->
            </html>
            <!-- this is a top level comment -->
        `;

        const interceptor = createInterceptor(html);

        await minify(interceptor);

        assert.strictEqual(interceptor.body, expected);
    });

    it(`basic minification with normal text`, async () => {
        const expected = 'this is the first line, this is the second line!';
        const textContent = `
            this is the first line,
            this is the second line!
        `;

        const interceptor = createInterceptor(textContent);

        await minify(interceptor);

        assert.strictEqual(interceptor.body, expected);
    });

    it(`basic minification with json text`, async () => {
        const json = { body: 'someContent', headers: {}, statusCode: 200 };
        const textContent = JSON.stringify(json, null, 4);

        const interceptor = createInterceptor(textContent);

        await minify(interceptor);

        assert.strictEqual(interceptor.body, JSON.stringify(json));
    });

    it(`basic minification with xml content`, async () => {
        const expected = `<xml><one>some content here</one></xml>`;
        const xml = `
            <xml>
                <one>
                    some content here
                </one>
            </xml>
        `;

        const interceptor = createInterceptor(xml, true);

        await minify(interceptor);

        assert.strictEqual(interceptor.body, expected);
    });
});
