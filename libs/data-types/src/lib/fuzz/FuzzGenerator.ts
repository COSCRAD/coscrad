import { FailedToGenerateFuzzForUnsupportedDataTypeException } from '../exceptions';
import { CoscradDataType } from '../types';

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

    if (isArray) {
        const numberOfElementsInEachArray = 5;

        return invalidValuesAndDescriptions.map(({ value, description }) => ({
            description: `${description}[]`,
            value: Array(numberOfElementsInEachArray).fill(value),
        }));
    }

    return invalidValuesAndDescriptions;
};

export class FuzzGenerator {
    constructor(private readonly schema: CoscradDataSchema) {}

    generateInvalidValues() {
        return generateInvalidValuesForProperty(this.schema);
    }
}
