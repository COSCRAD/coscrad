import { InternalError } from '../../../../lib/errors/InternalError';
import { PageIdentifier } from '../entities';

export class MissingPageContentError extends InternalError {
    constructor(pageIdentifier: PageIdentifier) {
        super(
            `You cannot manage content for page: ${pageIdentifier}, as there is no content for this page`
        );
    }
}
