import { FormFieldType } from '@coscrad/api-interfaces';
import { updateFormState } from './actions/update-form-state';
import { formStateReducer } from './form-state-reducer';

type TestCase = {
    description: string;
    initialState: Record<string, unknown>;
    update: [propertyKey: string, newValue: unknown];
    expectedUpdatedState: Record<string, unknown>;
};

const fieldTypeNewAndExistingValues: [FormFieldType, unknown, unknown][] = [
    [FormFieldType.textField, 'hi', 'goodbye'],
];

const generatedTestCases: TestCase[] = fieldTypeNewAndExistingValues.flatMap(
    ([formFieldType, initialValue, updateValue]) => [
        {
            description: `when updating an existing value for field: ${formFieldType}`,
            initialState: {
                foo: 5,
                bar: initialValue,
            },
            update: ['bar', updateValue],
            expectedUpdatedState: {
                foo: 5,
                bar: updateValue,
            },
        },
        {
            description: `when updating a new value for the first time for field: ${formFieldType}`,
            initialState: {
                foo: 5,
            },
            update: ['bar', updateValue],
            expectedUpdatedState: {
                foo: 5,
                bar: updateValue,
            },
        },
        {
            description: `when removing a value by setting it to undefined`,
            initialState: {
                foo: 5,
                bar: initialValue,
            },
            update: ['bar', undefined],
            expectedUpdatedState: {
                foo: 5,
                // we may eventually want to remove the prop in this case
                bar: undefined,
            },
        },
    ]
);

const testCases: TestCase[] = [
    ...generatedTestCases,
    {
        description: 'when updating a text field to an empty string',
        initialState: {
            foo: [1, 2, 3],
            bar: 'hello',
        },
        update: ['bar', ''],
        expectedUpdatedState: {
            foo: [1, 2, 3],
            bar: undefined,
        },
    },
];

describe('formStateReducer', () => {
    testCases.forEach(
        ({ description, initialState, update: [key, value], expectedUpdatedState }) => {
            describe(description, () => {
                it('should make the expected state update', () => {
                    const result = formStateReducer(initialState, updateFormState(key, value));

                    expect(result).toEqual(expectedUpdatedState);
                });
            });
        }
    );
});
