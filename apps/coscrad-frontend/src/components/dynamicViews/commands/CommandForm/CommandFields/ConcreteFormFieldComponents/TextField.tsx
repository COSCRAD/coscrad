import { IFormField } from '@coscrad/api-interfaces';
import { ICommandFormFieldComponent } from '../../command-form-component.interface';

export const TextField: ICommandFormFieldComponent = ({
    name,
    description,
    type: fieldType,
}: IFormField) => (
    <label>
        {/* label: {label} */}
        name: {name} | {description} | I should be a field of type: {fieldType}
        <input type="text" name={name}></input>
    </label>
);
