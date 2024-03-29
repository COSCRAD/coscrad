import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import buildInvariantValidationErrorFactoryFunction from '../../../__tests__/utilities/buildInvariantValidationErrorFactoryFunction';
import { Category } from '../../../models/categories/entities/category.entity';
import { AggregateType } from '../../../types/AggregateType';
import { CategorizableType } from '../../../types/CategorizableType';
import { Valid } from '../../Valid';

const buildTopLevelError = buildInvariantValidationErrorFactoryFunction(AggregateType.category);

type InvalidTestCase = {
    description: string;
    dto: unknown;
    expectedError: InternalError;
};

const validDTO: DTO<Category> = {
    type: AggregateType.category,
    id: '12',
    label: 'props',
    members: [
        {
            type: CategorizableType.note,
            id: '55',
        },
        {
            type: CategorizableType.digitalText,
            id: '123',
        },
    ],
    childrenIDs: ['33'],
};

const invalidTestCases: InvalidTestCase[] = [
    {
        description: 'when one the category members is of an invalid type',
        dto: {
            ...validDTO,
            members: ['foo'],
        },
        expectedError: buildTopLevelError(validDTO.id, [
            // TODO check inner Error
        ]),
    },
];

// TODO [test-coverage] add variety of valid cases
describe('the category invariants validator', () => {
    describe('when the input is valid', () => {
        it('should return Valid', () => {
            const instance = new Category(validDTO);

            const result = instance.validateInvariants();

            expect(result).toBe(Valid);
        });
    });

    invalidTestCases.forEach(({ description, dto, expectedError }) =>
        describe.only(description, () => {
            it('should return the expected error', () => {
                const instance = new Category(dto as DTO<Category>);

                const result = instance.validateInvariants();

                assertErrorAsExpected(result, expectedError);
            });
        })
    );
});
