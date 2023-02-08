import { IFormField } from '@coscrad/api-interfaces';
import { TextField } from '@mui/material';

interface MultilingualTextInputProps {
    formField: IFormField;
    onInputChange?: (name: string, value: unknown) => void;
    required: boolean;
}

export const MultilingualTextInput = ({
    formField: { name, label },
    onInputChange,
    required,
}: MultilingualTextInputProps): JSX.Element => (
    <div>
        English:
        <TextField
            name={`${name}:eng`}
            label={label}
            onChange={(e) => {
                // TODO type safety!
                const multiLingualTextValue = {
                    items: [
                        {
                            languageId: 'eng',
                            text: e.target.value,
                            role: 'original',
                        },
                    ],
                };

                console.log({ multiLingualTextValue });

                onInputChange(name, multiLingualTextValue);
            }}
            required={required}
        />
    </div>
);
