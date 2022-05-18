import { InternalError } from '../../../../../../lib/errors/InternalError';
import buildTestData from '../../../../../../test-data/buildTestData';
import { IBibliographicReference } from '../../../../../models/bibliographic-reference/interfaces/IBibliographicReference';
import { BibliographicReferenceType } from '../../../../../models/bibliographic-reference/types/BibliographicReferenceType';

export default (
    bibliographicReferenceType: BibliographicReferenceType
): IBibliographicReference => {
    if (bibliographicReferenceType !== BibliographicReferenceType.book) {
        throw new InternalError('Not implemented');
    }

    return buildTestData().resources.bibliographicReference[0];
};
