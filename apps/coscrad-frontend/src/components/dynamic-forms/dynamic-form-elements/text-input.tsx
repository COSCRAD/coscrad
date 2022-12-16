import { IFormField } from '@coscrad/api-interfaces';
import { FormGroup, TextField } from '@mui/material';

interface TextInputProps {
    formField: IFormField;
    onNewSelection?: (name: string, value: string | boolean) => void;
}

export const TextInput = ({ formField: { description, name } }: TextInputProps): JSX.Element => {
    return (
        <FormGroup>
            <h3>{description}</h3>
            <TextField label={name} />
        </FormGroup>
    );
};
