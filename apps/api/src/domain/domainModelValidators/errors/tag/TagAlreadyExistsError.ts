import { InternalError } from '../../../../lib/errors/InternalError';

export default class TagAlreadyExistsError extends InternalError {
    constructor(text: string) {
        const message = `The tag ${text} already exists`;

        super(message);
    }
}
