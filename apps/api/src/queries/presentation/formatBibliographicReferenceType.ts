import { BibliographicReferenceType } from '../../domain/models/bibliographic-reference/types/BibliographicReferenceType';
import { isNullOrUndefined } from '../../domain/utilities/validation/is-null-or-undefined';
import { InternalError } from '../../lib/errors/InternalError';
import capitalizeEveryFirstLetter from '../../lib/utilities/strings/capitalizeEveryFirstLetter';

const lookupTable: { [K in BibliographicReferenceType]: string } = {
    [BibliographicReferenceType.book]: 'book',
    [BibliographicReferenceType.courtCase]: 'court case',
    [BibliographicReferenceType.journalArticle]: 'journal article',
};

export default (type: BibliographicReferenceType): string => {
    const lookupResult = lookupTable[type];

    if (isNullOrUndefined(lookupResult))
        throw new InternalError(`Failed to find an entry for ${type}`);

    return capitalizeEveryFirstLetter(lookupResult);
};
