import { IFormField } from '@coscrad/api-interfaces';
import { FormGroup, TextField } from '@mui/material';

interface NumericInputProps {
    formField: IFormField;
    onInputChange?: (name: string, value: string | boolean | number) => void;
    required: boolean;
}

export const NumericInput = ({
    formField: { name, label },
    onInputChange,
    required,
}: NumericInputProps): JSX.Element => {
    return (
        <FormGroup>
            <TextField
                inputProps={{ type: 'number' }}
                name={name}
                label={label}
                onChange={(e) => {
                    const parsedValue =
                        typeof e.target.value === 'string' ? Number(e.target.value) : null;

                    onInputChange(e.target.name, parsedValue);
                }}
                required={required}
            />
        </FormGroup>
    );
};