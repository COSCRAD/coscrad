import { AggregateType, FormFieldType, HttpStatusCode, IFormField } from '@coscrad/api-interfaces';
import {
    CoscradConstraint,
    isConstraintSatisfied,
    isNullOrUndefined,
} from '@coscrad/validation-constraints';
import { useState } from 'react';
import { ErrorDisplay } from '../../error-display/error-display';
import { DynamicSelect } from './dynamic-select';
import { NumericInput } from './numeric-input';
import { StaticSelect } from './static-select';
import { TextInput } from './text-input';
import { YearPicker } from './year-picker';

type VocabularyListFormElementProps = {
    formField: IFormField;
    onElementChange?: (key: string, value: unknown) => void;
    currentValue: unknown;
    required: boolean;
};

export const DynamicFormElement = ({
    formField,
    onElementChange,
    currentValue,
    required,
}: VocabularyListFormElementProps): JSX.Element => {
    const [_validationMessage, setValidationMessage] = useState('');

    const { type, options } = formField;

    const onElementChangeWithValidation = (key: string, value: string | boolean) => {
        setValidationMessage(
            formField.constraints.reduce(
                (accValidationMessage: string, constraint) =>
                    accValidationMessage.concat(
                        isConstraintSatisfied(constraint.name as CoscradConstraint, currentValue)
                            ? ''
                            : `\n${constraint.message}`
                    ),
                ''
            )
        );

        if (!isNullOrUndefined(onElementChange)) onElementChange(key, value);
    };

    if (type === FormFieldType.switch || type === FormFieldType.staticSelect)
        return (
            <StaticSelect
                data-testid={`command-form:${type}:${formField.name}`}
                formField={formField}
                onNewSelection={onElementChangeWithValidation}
                currentValue={currentValue as string}
                required={required}
            />
        );

    if (type === FormFieldType.textField)
        return (
            <TextInput
                formField={formField}
                onInputChange={onElementChangeWithValidation}
                required={required}
            ></TextInput>
        );

    /**
     * TODO [https://www.pivotaltracker.com/story/show/184065964]
     * We need to 'transform' data to proper JSON on submit.
     */
    if (type === FormFieldType.jsonInput)
        return (
            <TextInput
                formField={formField}
                onInputChange={onElementChangeWithValidation}
                required={required}
            ></TextInput>
        );

    if (type === FormFieldType.numericInput)
        return (
            <NumericInput
                formField={formField}
                onInputChange={onElementChangeWithValidation}
                required={required}
            ></NumericInput>
        );

    if (type === FormFieldType.yearPicker)
        return (
            <YearPicker
                formField={formField}
                onNewSelection={onElementChangeWithValidation}
                currentValue={currentValue as number}
                required={required}
            />
        );

    if (type === FormFieldType.dynamicSelect) {
        return (
            <DynamicSelect
                aggregateType={
                    (options as unknown as { aggregateType: AggregateType }).aggregateType
                }
                simpleFormField={formField}
                onNewSelection={onElementChangeWithValidation}
                currentValue={currentValue as string}
                required={required}
            />
        );
    }

    // TODO Can we update the type of this function's parameters instead to exclude this possiblity?
    if (type === FormFieldType.populatedFromView) {
        throw new Error(`Not Implemented: Support for binding a view to a form field`);
    }

    const exhaustiveCheck: never = type;

    return (
        <ErrorDisplay
            code={HttpStatusCode.internalError}
            message={`Failed to build a form element for unsupporeted type: ${exhaustiveCheck}`}
        />
    );
};
