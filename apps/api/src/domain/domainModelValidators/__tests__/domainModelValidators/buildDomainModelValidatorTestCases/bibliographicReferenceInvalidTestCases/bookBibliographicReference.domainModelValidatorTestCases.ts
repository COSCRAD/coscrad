import { EntityId } from '../../../../../../domain/types/ResourceId';
import { resourceTypes } from '../../../../../../domain/types/resourceTypes';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { BookBibliographicReference } from '../../../../../models/bibliographic-reference/entities/book-bibliographic-reference.entity';
import { BibliographicReferenceType } from '../../../../../models/bibliographic-reference/types/BibliographicReferenceType';
import InvalidEntityDTOError from '../../../../errors/InvalidEntityDTOError';
import { DomainModelValidatorInvalidTestCase } from '../../../types/DomainModelValidatorTestCase';
import getValidBibliographicReferenceInstanceForTest from '../utils/getValidBibliographicReferenceInstanceForTest';

const validDto = getValidBibliographicReferenceInstanceForTest(BibliographicReferenceType.book);

const buildTopLevelError = (id: EntityId, innerErrors: InternalError[]): InternalError =>
    new InvalidEntityDTOError(resourceTypes.bibliographicReference, id, innerErrors);

export const buildBookBibliographicReferenceTestCases =
    (): DomainModelValidatorInvalidTestCase<BookBibliographicReference>[] => [
        {
            description: 'The title is an empty string',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    title: '',
                },
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
    ];
