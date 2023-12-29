import { InternalError } from '../../../../lib/errors/InternalError';

export default class IdentityConnectionFromMemberNotABibliographicCitationError extends InternalError {
    constructor() {
        super(`The from member for an identity edge connection must be a bibliographic citation`);
    }
}
