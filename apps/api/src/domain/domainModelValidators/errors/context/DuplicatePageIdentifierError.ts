import { InternalError } from '../../../../lib/errors/InternalError';
import { PageIdentifier } from '../../../models/book/entities/types/PageIdentifier';

export default class DuplicatePageIdentifierError extends InternalError {
    constructor(duplicatePageIdentifiers: PageIdentifier[]) {
        const commaSeparatedListOfIdentifiers = duplicatePageIdentifiers
            .reduce((accumulatedList, identifier) => accumulatedList.concat(` ${identifier},`), '')
            // Drop the last ','
            .slice(0, -1);

        const msg = [
            duplicatePageIdentifiers.length < 2
                ? 'Duplicate page identifier:'
                : `Duplicate page identifiers:`,
            commaSeparatedListOfIdentifiers,
        ].join('');

        super(msg);
    }
}
