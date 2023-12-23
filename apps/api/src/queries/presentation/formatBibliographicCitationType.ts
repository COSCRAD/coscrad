import { BibliographicCitationType } from '../../domain/models/bibliographic-citation/types/bibliographic-citation-type';
import { isNullOrUndefined } from '../../domain/utilities/validation/is-null-or-undefined';
import { InternalError } from '../../lib/errors/InternalError';
import capitalizeEveryFirstLetter from '../../lib/utilities/strings/capitalizeEveryFirstLetter';

const lookupTable: { [K in BibliographicCitationType]: string } = {
    [BibliographicCitationType.book]: 'book',
    [BibliographicCitationType.courtCase]: 'court case',
    [BibliographicCitationType.journalArticle]: 'journal article',
};

export default (type: BibliographicCitationType): string => {
    const lookupResult = lookupTable[type];

    if (isNullOrUndefined(lookupResult))
        throw new InternalError(`Failed to find an entry for ${type}`);

    return capitalizeEveryFirstLetter(lookupResult);
};
