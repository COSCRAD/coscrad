import { IFormField } from '@coscrad/api-interfaces';
import { FormGroup, TextField } from '@mui/material';

interface TextInputProps {
    formField: IFormField;
    onInputChange?: (name: string, value: string | boolean) => void;
    required: boolean;
}

export const TextInput = ({
    formField: { name, label },
    onInputChange,
    required,
}: TextInputProps): JSX.Element => {
    return (
        <FormGroup>
            <TextField
                data-testid={`text_${name}`}
                name={name}
                label={label}
                onChange={(e) => {
                    onInputChange(e.target.name, e.target.value);
                }}
                required={required}
            />
        </FormGroup>
    );
};
