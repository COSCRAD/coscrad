import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { Category } from '../../../models/categories/entities/category.entity';
import { noteType } from '../../../models/categories/types/ResourceTypeOrNoteType';
import { resourceTypes } from '../../../types/resourceTypes';
import categoryValidator from '../../categoryValidator';
import InvalidCategoryDTOError from '../../errors/category/InvalidCategoryDTOError';
import InvalidCategoryMemberReferenceError from '../../errors/category/InvalidCategoryMemberReferenceError';
import MissingCategoryLabelError from '../../errors/category/MissingCategoryLabelError';
import NullOrUndefinedCategoryDTOError from '../../errors/category/NullOrUndefinedCategoryDTOError';
import { Valid } from '../../Valid';

const buildTopLevelError = (innerErrors: InternalError[]): InternalError =>
    new InvalidCategoryDTOError(innerErrors);

type InvalidTestCase = {
    description: string;
    dto: unknown;
    expectedError: InternalError;
};

const validDTO: DTO<Category> = {
    id: '12',
    label: 'props',
    members: [
        {
            type: noteType,
            id: '55',
        },
        {
            type: resourceTypes.book,
            id: '123',
        },
    ],
    childrenIDs: ['33'],
};

const invalidTestCases: InvalidTestCase[] = [
    {
        description: 'when the dto is undefind',
        dto: undefined,
        expectedError: new NullOrUndefinedCategoryDTOError(),
    },
    {
        description: 'when the dto is null',
        dto: null,
        expectedError: new NullOrUndefinedCategoryDTOError(),
    },
    {
        description: 'when the label is an empty string',
        dto: {
            ...validDTO,
            label: '',
        },
        expectedError: buildTopLevelError([new MissingCategoryLabelError(validDTO.id)]),
    },
    {
        description: 'when one the category members is of an invalid type',
        dto: {
            ...validDTO,
            members: ['foo'],
        },
        expectedError: buildTopLevelError([new InvalidCategoryMemberReferenceError(['foo'])]),
    },
];

// TODO [test-coverage] add variety of valid cases

describe('the category invariants validator', () => {
    describe('when the input is valid', () => {
        it('should return Valid', () => {
            const result = categoryValidator(validDTO);

            expect(result).toBe(Valid);
        });
    });

    invalidTestCases.forEach(({ description, dto, expectedError }) =>
        describe(description, () => {
            it('should return the expected error', () => {
                const result = categoryValidator(dto);

                expect(result).toEqual(expectedError);

                const innerErrors = (result as InternalError).innerErrors;

                expect(innerErrors).toEqual(expectedError.innerErrors);
            });
        })
    );
});
