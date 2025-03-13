import { InternalError } from '../../../../lib/errors/InternalError';

export class FileNotFound extends InternalError {
    constructor(path: string) {
        super(`There is no file with the path: ${path}`);
    }
}
