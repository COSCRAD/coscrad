import { IFormField } from '@coscrad/api-interfaces';
import { FormGroup, TextField } from '@mui/material';

interface TextInputProps {
    formField: IFormField;
    onInputChange?: (name: string, value: string | boolean) => void;
}

export const TextInput = ({
    formField: { description, name, label },
    onInputChange,
}: TextInputProps): JSX.Element => {
    return (
        <FormGroup>
            <h3>{description}</h3>
            <TextField
                name={name}
                label={label}
                onChange={(e) => {
                    onInputChange(e.target.name, e.target.value);
                }}
            />
        </FormGroup>
    );
};
