import { InternalError } from '../../../../../../lib/errors/InternalError';
import buildTestData from '../../../../../../test-data/buildTestData';
import { IBibliographicReference } from '../../../../../models/bibliographic-reference/interfaces/IBibliographicReference';
import { BibliographicReferenceType } from '../../../../../models/bibliographic-reference/types/BibliographicReferenceType';

export default (
    bibliographicReferenceType: BibliographicReferenceType
): IBibliographicReference => {
    const searchResult = buildTestData().resources.bibliographicReference.find(
        ({ data: { type } }) => type === bibliographicReferenceType
    );

    if (!searchResult)
        throw new InternalError(
            `Test data missing for bibliographic reference with type: ${bibliographicReferenceType}`
        );

    return searchResult;
};
