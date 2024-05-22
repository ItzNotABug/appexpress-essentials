/**
 * Source Reference: https://github.com/node-loader/node-loader-babel
 *
 * Disclaimer: This implementation is based on the original source from the provided URL.
 * Modifications were made to address issues with handling `.jsx` extensions,
 * which were not properly supported in the default implementation.
 * These modifications allow for explicit handling of the `.jsx` file type.
 */
import urlModule from 'url';
import { loadOptionsAsync, transformAsync } from '@babel/core';

const supportedModuleFormats = ['module', 'commonjs'];

export async function load(url, context, defaultLoad) {
    if (useLoader(url)) {
        if (
            url.endsWith('.jsx') ||
            url.endsWith('.ts') ||
            url.endsWith('.tsx')
        ) {
            context.format = 'module';
        }

        const { source, format } = await defaultLoad(url, context, defaultLoad);
        if (!source || !supportedModuleFormats.includes(format)) {
            return { source, format };
        }

        const filename = urlModule.fileURLToPath(url);

        const options = await loadOptionsAsync({
            sourceType: format || 'module',
            root: process.cwd(),
            rootMode: 'root',
            filename: filename,
            configFile: false,
            presets: [
                ['@babel/preset-typescript'],
                ['@babel/preset-react', { runtime: 'automatic' }],
            ],
        });

        const transformed = await transformAsync(source, options);
        return { source: transformed.code, format: 'module' };
    } else {
        return defaultLoad(url, context, defaultLoad);
    }
}

function useLoader(url) {
    return !/node_modules/.test(url) && !/node:/.test(url);
}
