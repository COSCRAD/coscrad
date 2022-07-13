import { CoscradDataType, getCoscradDataSchema } from '@coscrad/data-types';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../../types/DTO';
import InvalidCoscradUserGroupDTOError from '../../../../../domainModelValidators/errors/InvalidCoscradUserGroupDTOError';
import { Valid } from '../../../../../domainModelValidators/Valid';
import { AggregateType } from '../../../../../types/AggregateType';
import { Aggregate } from '../../../../aggregate.entity';
import assertCoscradDataTypeError from '../../../../__tests__/invariant-validation-helpers/assertCoscradDataTypeError';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { CoscradUserGroup } from '../coscrad-user-group.entity';

/**
 * TODO [https://www.pivotaltracker.com/story/show/182217249]
 * Let's extract the following to a separate utility- possibly
 * even within the `@coscrad/data-types` lib.
 */
type ValueAndDescription<T = unknown> = {
    value: T;
    description: string;
};

type CoscradDataSchema = {
    type: CoscradDataType;
    isArray: boolean;
    isOptional: boolean;
};

const fuzzData = {
    emptyString: '',
    positiveInteger: 99,
    negativeInteger: -33,
    positiveDecimal: 33.3,
    negativeDecimal: -122.345,
    infinity: Infinity,
    negativeInfinity: -Infinity,
    zero: 0,
    emptyObject: {},
    shallowObject: { foo: 55, bar: 'hello' },
    deeplyNestedObject: { foo: 5, bar: { baz: 'hello world', yaz: [1, 44, -23.4] } },
    emptyArray: [],
    url: `https://www.mysite.com/hello.mp3`,
    randomString: 'this is some really 343434938298392 random string!',
    uuid: `249d797b-1f18-49d3-8de0-9e338783306b`,
    null: null,
    undefined: undefined,
} as const;

type FuzzDataType = keyof typeof fuzzData;

const dataTypeToValidFuzz: Record<CoscradDataType, FuzzDataType[]> = {
    [CoscradDataType.NonEmptyString]: ['url', 'randomString', 'uuid'],
    [CoscradDataType.Enum]: [],
    [CoscradDataType.NonNegativeFiniteNumber]: ['positiveInteger', 'positiveDecimal'],
    [CoscradDataType.RawData]: ['shallowObject', 'deeplyNestedObject'],
    [CoscradDataType.URL]: ['url'],
    [CoscradDataType.UUID]: ['uuid'],
};

const generateInvalidValuesForProperty = ({
    type,
    isArray,
    isOptional,
}: CoscradDataSchema): ValueAndDescription[] => {
    const validFuzzKeys = dataTypeToValidFuzz[type];

    if (!Array.isArray(validFuzzKeys)) {
        throw new InternalError(`Failed to generate fuzz for unsupported data type: ${type}`);
    }

    if (isOptional) {
        validFuzzKeys.push('null', 'undefined');
    }

    const invalidValuesAndDescriptions = Object.entries(fuzzData).reduce(
        (acc: ValueAndDescription[], [key, value]: [FuzzDataType, unknown]) =>
            validFuzzKeys.includes(key)
                ? acc
                : acc.concat({
                      value,
                      description: key,
                  }),
        []
    );

    if (isArray) {
        const numberOfElementsInEachArray = 5;

        return invalidValuesAndDescriptions.map(({ value, description }) => ({
            description: `${description}[]`,
            value: Array(numberOfElementsInEachArray).fill(value),
        }));
    }

    return invalidValuesAndDescriptions;
};

const validGroupDto: DTO<CoscradUserGroup> = {
    type: AggregateType.userGroup,
    id: buildDummyUuid(),
    label: 'test user group',
    userIds: ['123'],
    description: 'This is a test user group.',
};

// TODO [design] Consider making this a class.
const createInvalidAggregateFactory =
    <T extends DTO<Aggregate>>(validAggregate: T) =>
    // TODO Support 'keys to exclude'
    (overrides: { [K in keyof DTO<T>]?: unknown }): DTO<T> =>
        ({
            ...validAggregate,
            ...overrides,
        } as DTO<T>);

const buildInvalidGroupDto = createInvalidAggregateFactory(validGroupDto);

const dataSchema = getCoscradDataSchema(CoscradUserGroup);

describe('CoscradUserGroup.validateInvariants', () => {
    describe('when the data is valid', () => {
        it('should return Valid', () => {
            const validInstance = new CoscradUserGroup(validGroupDto);

            const result = validInstance.validateInvariants();

            expect(result).toBe(Valid);
        });
    });

    describe('when the data is invalid', () => {
        describe('when a simple invariant (generalized type) rule fails', () => {
            Object.entries(dataSchema).forEach(([propertyName, propertySchema]) => {
                describe(`when the property: ${propertyName} is invalid`, () => {
                    const invalidValuesToUse = generateInvalidValuesForProperty(propertySchema);

                    invalidValuesToUse.forEach(({ value, description }) => {
                        describe(`when given the invalid value: ${JSON.stringify(
                            value
                        )} (${description})`, () => {
                            it('should return the expected error', () => {
                                const invalidDto = buildInvalidGroupDto({
                                    id: value,
                                });

                                const invalidInstance = new CoscradUserGroup(invalidDto);

                                const result = invalidInstance.validateInvariants();

                                assertCoscradDataTypeError(
                                    result as InternalError,
                                    'id',
                                    InvalidCoscradUserGroupDTOError
                                );
                            });
                        });
                    });
                });
            });
        });
    });
});
