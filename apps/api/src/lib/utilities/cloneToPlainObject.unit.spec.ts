import { DTO } from '../../types/DTO';
import cloneToPlainObject from './cloneToPlainObject';

type TestCase = {
    description: string;
    input: object;
    expectedOutput: Record<string, unknown>;
};

class DummyHelperClass {
    constructor(public readonly helperProp: number) {}

    public addMyNumberTo(input: number) {
        return input + this.helperProp;
    }
}

class DummyClass {
    myHelper: DummyHelperClass;

    constructor(
        public readonly foo: number,
        public readonly bar: string[],
        public readonly baz: string,
        helperPropToPassOn: number
    ) {
        this.myHelper = new DummyHelperClass(helperPropToPassOn);
    }
}

const dummyClassDto: DTO<DummyClass> = {
    foo: 7,
    bar: ['a', 'b'],
    baz: 'hello world',
    myHelper: {
        helperProp: 77,
    },
};

const dummyClassInstance = new DummyClass(
    dummyClassDto.foo,
    dummyClassDto.bar as string[],
    dummyClassDto.baz,
    dummyClassDto.myHelper.helperProp
);

const testCases: TestCase[] = [
    {
        description: 'when the input is an empty object {}',
        input: {},
        expectedOutput: {},
    },
    {
        description: 'when the input has no methods',
        input: {
            foo: 6,
            bar: [1, 2, 3],
            baz: 'hello world',
        },
        expectedOutput: {
            foo: 6,
            bar: [1, 2, 3],
            baz: 'hello world',
        },
    },
    {
        description: 'when the input has methods',
        input: {
            foo: [['a', 'ab'], 'abc'],
            bar: 78.5,
            baz: 'test prop',
            arrowValuedProp: (x: number): number => 2 * x,
            trueMethod(message) {
                return `incoming message: ${message}`;
            },
        },
        expectedOutput: {
            foo: [['a', 'ab'], 'abc'],
            bar: 78.5,
            baz: 'test prop',
        },
    },
    {
        description: 'a class instance with a nested property that is an instance',
        input: dummyClassInstance,
        expectedOutput: dummyClassDto,
    },
];

describe('cloneToPlainObject', () =>
    testCases.forEach(({ description, input, expectedOutput: output }) => {
        describe(description, () => {
            const result = cloneToPlainObject(input);

            it('should return the expected result', () => {
                expect(result).toEqual(output);
            });

            // TODO We should do a deep check for this as well (on nested properties)
            it('should not return a shared reference to the original object', () => {
                expect(result).not.toBe(input);
            });
        });
    }));
