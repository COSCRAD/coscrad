import { InternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';

export default class BibliographicCitationHasNoDataError extends InternalError {
    constructor(id?: AggregateId) {
        const msg = [
            `Bibliographic citation`,
            id ? `: ${id}` : ``,
            `is missing a data property`,
        ].join(' ');

        super(msg);
    }
}
