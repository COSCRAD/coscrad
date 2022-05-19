import { InternalError } from '../../../../lib/errors/InternalError';
import { EntityId } from '../../../types/ResourceId';

export default class BibliographicReferenceHasNoDataError extends InternalError {
    constructor(id?: EntityId) {
        const msg = [
            `Bibliographic reference`,
            id ? `: ${id}` : ``,
            `is missing a data property`,
        ].join(' ');

        super(msg);
    }
}
