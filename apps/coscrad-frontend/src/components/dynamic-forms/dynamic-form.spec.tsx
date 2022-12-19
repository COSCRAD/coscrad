import { FormFieldType, IDynamicForm } from '@coscrad/api-interfaces';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../utils/test-utils';
import { DynamicForm } from './dynamic-form';

const flatForm: IDynamicForm = {
    label: 'Flat Form',
    description: 'this form has no nested properties',
    fields: [
        {
            type: FormFieldType.staticSelect,
            name: 'priorityRanking',
            label: 'priority',
            description: 'rank priority 1-5',
            options: [
                {
                    display: 'highest',
                    value: 5,
                },
                {
                    display: 'high',
                    value: 4,
                },
                {
                    display: 'medium',
                    value: 3,
                },
                {
                    display: 'low',
                    value: 2,
                },
                {
                    display: 'lowest',
                    value: 1,
                },
            ],
        },
        {
            type: FormFieldType.jsonInput,
            name: 'rawData',
            label: 'legacy raw data',
            description: 'Copy and paste raw data from the legacy API',
        },
        {
            type: FormFieldType.textField,
            name: 'item name',
            label: 'itemName',
            description: 'Free form string defined by user',
        },
        {
            type: FormFieldType.numericInput,
            name: 'weight',
            label: 'itemWeight',
            description: 'the weight of the item',
        },
        {
            type: FormFieldType.switch,
            name: 'isPaid',
            label: 'paid?',
            description: 'has the item been paid for?',
            // TODO Add type safety here
            options: [
                {
                    display: 'Yes',
                    value: true,
                },

                {
                    display: 'No',
                    value: false,
                },
            ],
        },
        {
            type: FormFieldType.yearPicker,
            name: 'orderYear',
            label: 'Year',
            description: 'When was the order placed?',
        },
    ],
};

describe('Dynamic Form', () => {
    describe('when the form is flat (no nested forms)', () => {
        describe('the test case', () => {
            Object.values(FormFieldType).forEach((formFieldType) => {
                it(`should have a form field of type ${formFieldType} (comphrensive check)`, () => {
                    const isThereAFieldOfThisType = flatForm.fields.some(
                        ({ type }) => type === formFieldType
                    );

                    expect(isThereAFieldOfThisType).toBe(true);
                });
            });
        });

        it('should render correctly', () => {
            renderWithProviders(<DynamicForm {...flatForm} />);

            expect(screen.queryByTestId('error')).toBeFalsy();
        });
    });
});
