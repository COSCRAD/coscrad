import { InternalError } from '../../../../lib/errors/InternalError';

export default class InvalidCategoryMemberReferenceError extends InternalError {
    constructor(members: unknown) {
        const msg = [
            `One or more of the following category member references`,
            `has an invalid type:`,
            JSON.stringify(members),
        ].join(' ');

        super(msg);
    }
}
