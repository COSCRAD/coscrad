import { InternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';

export default class BibliographicReferenceHasNoDataError extends InternalError {
    constructor(id?: AggregateId) {
        const msg = [
            `Bibliographic reference`,
            id ? `: ${id}` : ``,
            `is missing a data property`,
        ].join(' ');

        super(msg);
    }
}
