import { InternalError } from '../../../../../../lib/errors/InternalError';
import buildTestData from '../../../../../../test-data/buildTestData';
import { BibliographicReferenceTypeToInstance } from '../../../../../factories/complexFactories/buildBibliographicReferenceFactory/getCtorFromBibliographicReferenceType';
import { BibliographicReferenceType } from '../../../../../models/bibliographic-reference/types/BibliographicReferenceType';

export default <TBibliographicReferenceType extends BibliographicReferenceType>(
    bibliographicReferenceType: TBibliographicReferenceType
): BibliographicReferenceTypeToInstance[TBibliographicReferenceType] => {
    const searchResult = buildTestData().resources.bibliographicReference.find(
        ({ data: { type } }) => type === bibliographicReferenceType
    );

    if (!searchResult)
        throw new InternalError(
            `Test data missing for bibliographic reference with type: ${bibliographicReferenceType}`
        );

    return searchResult as unknown as BibliographicReferenceTypeToInstance[TBibliographicReferenceType];
};
