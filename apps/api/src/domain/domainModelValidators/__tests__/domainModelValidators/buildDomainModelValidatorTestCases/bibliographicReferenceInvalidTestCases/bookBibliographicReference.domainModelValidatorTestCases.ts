import { InternalError } from '../../../../../../lib/errors/InternalError';
import { BookBibliographicReference } from '../../../../../models/bibliographic-reference/entities/book-bibliographic-reference.entity';
import { BibliographicReferenceType } from '../../../../../models/bibliographic-reference/types/BibliographicReferenceType';
import { DomainModelValidatorInvalidTestCase } from '../../../types/DomainModelValidatorTestCase';
import getValidBibliographicReferenceInstanceForTest from '../utils/getValidBibliographicReferenceInstanceForTest';

const validDto = getValidBibliographicReferenceInstanceForTest(BibliographicReferenceType.book);

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
            expectedError: new InternalError('boo!!!'),
        },
    ];
