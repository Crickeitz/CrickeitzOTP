function isGzipSupported() {
    return 'CompressionStream' in globalThis;
}
const isNativeAsyncGzipReadError = (error)=>{
    if (!error || 'object' != typeof error) return false;
    const name = 'name' in error ? String(error.name) : '';
    return 'NotReadableError' === name;
};
async function gzipCompress(input, isDebug = true, options) {
    try {
        const dataStream = new Blob([
            input
        ], {
            type: 'text/plain'
        }).stream();
        const compressedStream = dataStream.pipeThrough(new CompressionStream('gzip'));
        return await new Response(compressedStream).blob();
    } catch (error) {
        if (options?.rethrow) throw error;
        if (isDebug) console.error('Failed to gzip compress data', error);
        return null;
    }
}
export { gzipCompress, isGzipSupported, isNativeAsyncGzipReadError };
