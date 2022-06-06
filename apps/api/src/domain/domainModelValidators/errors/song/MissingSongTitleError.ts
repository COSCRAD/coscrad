import { InternalError } from '../../../../lib/errors/InternalError';

export default class MissingSongTitleError extends InternalError {
    constructor() {
        super(`A song must have a title in at least one language`);
    }
}
