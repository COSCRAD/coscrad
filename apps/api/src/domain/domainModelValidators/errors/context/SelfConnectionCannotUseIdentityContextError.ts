import { InternalError } from '../../../../lib/errors/InternalError';

export default class SelfConnectionCannotUseIdentityContextError extends InternalError {
    constructor() {
        super(`A self edge connection cannot use the identity context`);
    }
}
