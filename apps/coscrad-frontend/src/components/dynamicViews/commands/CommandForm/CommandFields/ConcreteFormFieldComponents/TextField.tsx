import { IFormField } from '@coscrad/api-interfaces';
import { isStringWithNonzeroLength } from '@coscrad/validation';
import { ICommandFormFieldComponent, IHasOnChange } from '../../command-form-component.interface';

export const TextField: ICommandFormFieldComponent = ({
    name,
    description,
    type: fieldType,
    value,
    onChange,
}: IFormField & IHasOnChange & { value: string }) => {
    const validationFunction = (value: string): Error[] => {
        if (!isStringWithNonzeroLength(value))
            return [
                new Error(
                    `Form value: ${value} for property ${name} has failed the constraint: is string with nonzero length`
                ),
            ];

        return [];
    };

    const validationResult = validationFunction(value);

    const validationErrorMessage =
        validationResult.length > 0 ? `Must be a string with non-zero length` : ``;

    return (
        <label>
            {/* label: {label} */}
            name: {name} | {description} | I should be a field of type: {fieldType}
            <input type="text" name={name} value={value} onChange={onChange}></input>
            {validationErrorMessage}
        </label>
    );
};
