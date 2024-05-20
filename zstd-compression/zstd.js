import zstd from '@mongodb-js/zstd';

/**
 * Creates a compression utility object with `zstd` encoding.
 *
 * @param {Object} options - Configuration options for the compressor.
 * @param {number} options.level=9 - Compression level, defaults to 9.
 * Levels should be between `1` and `22`. If an invalid level is provided,
 * default level of `9` is used.
 * @returns {Object} A compression utility object containing supported encodings and a compression method.
 */
export default ({ level = 9 } = {}) => {
    return {
        encodings: new Set(['zstd']),

        /**
         * Compresses data using `zstd` compression.
         *
         * @param {Buffer} buffer - The data buffer to compress.
         * @param {function(string)} log - Function to log messages.
         * @param {function(string)} error - Function to handle errors.
         * @returns {Promise<Buffer>} A promise that resolves to the compressed data buffer or the base buffer if an exception occurred.
         */
        compress: async (buffer, log, error) => {
            const validLevel = validateLevel(level, log);

            try {
                return await zstd.compress(buffer, validLevel);
            } catch (err) {
                error(`Unable to compress content with zstd, ${err.message}`);
                return buffer;
            }
        },
    };
};

/**
 * Validates the compression level.
 *
 * @param {number} level - The proposed compression level.
 * @param {function(string)} log - Function to log messages.
 * @returns {number} The validated compression level, defaults to 9 if the input is invalid.
 */
const validateLevel = (level, log) => {
    if (typeof level === 'number' && level >= 1 && level <= 22) return level;
    else {
        log(
            `Invalid compression level (${level}) provided for zstd, using default level 9.`,
        );
        return 9;
    }
};
