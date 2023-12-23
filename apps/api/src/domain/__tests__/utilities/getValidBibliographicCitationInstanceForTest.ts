import { InternalError } from '../../../lib/errors/InternalError';
import buildBibliographicCitationTestData from '../../../test-data/buildBibliographicCitationTestData';
import { BibliographicCitationTypeToInstance } from '../../factories/complex-factories/build-bibliographic-citation-factory/get-ctor-from-bibliographic-citation-type';
import { BibliographicCitationType } from '../../models/bibliographic-citation/types/bibliographic-citation-type';

export default <TBibliographicCitationType extends BibliographicCitationType>(
    BibliographicCitationType: TBibliographicCitationType
): BibliographicCitationTypeToInstance[TBibliographicCitationType] => {
    const searchResult = buildBibliographicCitationTestData().find(
        ({ data: { type } }) => type === BibliographicCitationType
    );

    if (!searchResult)
        throw new InternalError(
            `Test data missing for bibliographic reference with type: ${BibliographicCitationType}`
        );

    return searchResult as unknown as BibliographicCitationTypeToInstance[TBibliographicCitationType];
};
