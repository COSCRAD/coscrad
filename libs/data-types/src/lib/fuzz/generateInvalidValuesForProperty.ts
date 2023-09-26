import { FailedToGenerateFuzzForUnsupportedDataTypeException } from '../exceptions';
import { CoscradDataType, CoscradPropertyTypeDefinition } from '../types';
import { isSimpleCoscradPropertyTypeDefinition } from '../types/SimpleCoscradPropertyTypeDefinition';

type ValueAndDescription<T = unknown> = {
    value: T;
    description: string;
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
    arbitraryString: 'this is some really 343434938298392 random string!',
    uuid: `249d797b-1f18-49d3-8de0-9e338783306b`,
    null: null,
    undefined: undefined,
    compositeIdentifier: { type: 'widget', id: '123' },
    year: 2002,
    isbn10: ` 0-940016-73-7`,
    isbn13: `978-3-16-148410-0`,
    true: true,
    false: false,
} as const;

type FuzzDataType = keyof typeof fuzzData;

type DataTypeToFuzz = { [K in CoscradDataType]: FuzzDataType[] };

const dataTypeToValidFuzz: DataTypeToFuzz = {
    [CoscradDataType.NonEmptyString]: [
        'url',
        'arbitraryString',
        'uuid',
        'isbn10',
        'isbn13',
        'emptyObject',
    ],
    [CoscradDataType.FiniteNumber]: [
        'positiveInteger',
        'positiveDecimal',
        'zero',
        'year',
        'negativeDecimal',
        'negativeInteger',
    ],
    [CoscradDataType.NonNegativeFiniteNumber]: [
        'positiveInteger',
        'positiveDecimal',
        'zero',
        'year',
    ],
    [CoscradDataType.RawData]: [
        'shallowObject',
        'deeplyNestedObject',
        'compositeIdentifier',
        'emptyObject',
    ],
    [CoscradDataType.URL]: ['url'],
    [CoscradDataType.UUID]: ['uuid'],
    [CoscradDataType.CompositeIdentifier]: ['compositeIdentifier'],
    [CoscradDataType.Year]: ['year', 'positiveInteger', 'zero'],
    [CoscradDataType.PositiveInteger]: ['year', 'positiveInteger'],
    [CoscradDataType.ISBN]: ['isbn10', 'isbn13'],
    [CoscradDataType.Boolean]: ['true', 'false'],
    [CoscradDataType.String]: ['emptyString', 'arbitraryString', 'uuid', 'isbn10', 'isbn13'],
    // TODO Add valid example here
    [CoscradDataType.FixedValue]: [],
};

export const generateValidValuesOfType = (
    propertyTypeDefinition: CoscradPropertyTypeDefinition
): unknown[] => {
    if (!isSimpleCoscradPropertyTypeDefinition(propertyTypeDefinition)) {
        /**
         * TODO[https://www.pivotaltracker.com/story/show/182715254]
         * Generate values for complex property types.
         */
        return [];
    }

    const { coscradDataType, isArray, isOptional } = propertyTypeDefinition;

    const validValues: unknown[] = dataTypeToValidFuzz[coscradDataType];

    if (!Array.isArray(validValues)) {
        throw new FailedToGenerateFuzzForUnsupportedDataTypeException(propertyTypeDefinition);
    }

    if (isOptional) {
        if (!isArray) {
            validValues.push(null, undefined);
        } else {
            validValues.push([]);
        }
    }

    if (isArray) {
        const numberOfElementsInEachArray = 7;

        return validValues.map((value) => Array(numberOfElementsInEachArray).fill(value));
    }

    return validValues;
};

export default (propertyTypeDefinition: CoscradPropertyTypeDefinition): ValueAndDescription[] => {
    /**
     * TODO [https://www.pivotaltracker.com/story/show/182715254]
     *
     * The condition checks if the property is a complex type (nested, union, or enum).
     * We need to generate appropriate fuzz for these cases as well.
     */
    const validFuzzKeys = isSimpleCoscradPropertyTypeDefinition(propertyTypeDefinition)
        ? dataTypeToValidFuzz[propertyTypeDefinition.coscradDataType]
        : [];

    const { isOptional, isArray } = propertyTypeDefinition;

    if (!Array.isArray(validFuzzKeys)) {
        throw new FailedToGenerateFuzzForUnsupportedDataTypeException(propertyTypeDefinition);
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

    /**
     * If the property's schema indicates that it's an array, we add in
     * various arrays of invalid types by turning each fuzz type into an array.
     *
     * TODO [test-coverage] return all non-array fuzz as well.
     */
    if (isArray) {
        const numberOfElementsInEachArray = 5;

        return (
            invalidValuesAndDescriptions
                // TODO Investigate nested array properties' behaviour here
                .filter(({ description }) => description !== 'emptyArray')
                .map(({ value, description }) => ({
                    description: `${description}[]`,
                    value: Array(numberOfElementsInEachArray).fill(value),
                }))
        );
    }

    return invalidValuesAndDescriptions;
};
