import { isNonEmptyObject } from '@coscrad/validation';
import { FailedToGenerateFuzzForUnsupportedDataTypeException } from '../exceptions';
import { CoscradDataType } from '../types';
import { CoscradDataSchema } from '../types/CoscradDataSchema';

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
    randomString: 'this is some really 343434938298392 random string!',
    uuid: `249d797b-1f18-49d3-8de0-9e338783306b`,
    null: null,
    undefined: undefined,
    compositeIdentifier: { type: 'widget', id: '123' },
    year: 2002,
    isbn10: ` 0-940016-73-7`,
    isbn13: `978-3-16-148410-0`,
} as const;

type FuzzDataType = keyof typeof fuzzData;

type DataTypeToFuzz = { [K in CoscradDataType]: FuzzDataType[] };

const dataTypeToValidFuzz: DataTypeToFuzz = {
    [CoscradDataType.NonEmptyString]: ['url', 'randomString', 'uuid', 'isbn10', 'isbn13'],
    [CoscradDataType.Enum]: [],
    [CoscradDataType.NonNegativeFiniteNumber]: [
        'positiveInteger',
        'positiveDecimal',
        'zero',
        'year',
    ],
    [CoscradDataType.RawData]: ['shallowObject', 'deeplyNestedObject', 'compositeIdentifier'],
    [CoscradDataType.URL]: ['url'],
    [CoscradDataType.UUID]: ['uuid'],
    [CoscradDataType.CompositeIdentifier]: ['compositeIdentifier'],
    [CoscradDataType.Year]: ['year', 'positiveInteger', 'zero'],
    [CoscradDataType.PositiveInteger]: ['year', 'positiveInteger'],
    [CoscradDataType.ISBN]: ['isbn10', 'isbn13'],
};

export const generateValidValuesOfType = ({
    coscradDataType: type,
    isArray,
    isOptional,
}: CoscradDataSchema): unknown[] => {
    const validValues = dataTypeToValidFuzz[type];

    if (!Array.isArray(validValues)) {
        throw new FailedToGenerateFuzzForUnsupportedDataTypeException(type);
    }

    if (isOptional) validValues.push(null, undefined);

    if (isArray) {
        const numberOfElementsInEachArray = 7;

        return validValues.map((value) => Array(numberOfElementsInEachArray).fill(value));
    }

    return validValues;
};

export default ({
    coscradDataType: type,
    isArray,
    isOptional,
}: CoscradDataSchema): ValueAndDescription[] => {
    /**
     * TODO [https://www.pivotaltracker.com/story/show/182715254]
     *
     * The condition checks if the property is itself a custom `Coscrad Data Type`.
     * It may be better to recurse here, but for now we get shallow type safety from
     * assigning any of the fuzz values.
     */
    const validFuzzKeys = isNonEmptyObject(type) ? [] : dataTypeToValidFuzz[type];

    if (!Array.isArray(validFuzzKeys)) {
        throw new FailedToGenerateFuzzForUnsupportedDataTypeException(type);
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
