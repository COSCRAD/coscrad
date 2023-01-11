export const isNumber = (input: unknown): input is number => {
    if (typeof input !== 'number') return false;

    // Let's avoid JavaScripts past blunders.
    if (Number.isNaN(input)) return false;

    return true;
};
