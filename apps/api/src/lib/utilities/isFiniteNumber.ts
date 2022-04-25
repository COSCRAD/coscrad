export default (input: unknown): input is Number =>
    typeof input === 'number' && !Number.isNaN(input) && Number.isFinite(input);
