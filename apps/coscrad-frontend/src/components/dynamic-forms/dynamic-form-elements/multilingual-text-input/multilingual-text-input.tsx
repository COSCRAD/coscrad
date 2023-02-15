import { IFormField, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    MenuItem,
    Select,
    Stack,
    TextField,
} from '@mui/material';
import { useReducer } from 'react';
import { multiLingualTextReducerWithNotification } from './actions/multilingual-text-form-reducer';
import { updateItemRole } from './actions/update-item-role';
import { updateItemText } from './actions/update-item-text';

type OnInputChange = (name: string, value: unknown) => void;

interface MultilingualTextInputProps {
    formField: IFormField;
    onInputChange?: OnInputChange;
    required: boolean;
}

interface SingleLanguageFieldProps {
    name: string;
    label: string;
    languageCode: LanguageCode;
    languageName: string;
    dispatch: React.Dispatch<unknown>;
}

const SingleLanguageField = ({
    name,
    label,
    languageCode,
    languageName,
    dispatch,
}: SingleLanguageFieldProps) => (
    <Accordion>
        <AccordionSummary>{languageName}</AccordionSummary>
        <AccordionDetails>
            <Stack>
                <TextField
                    name={`${name}:${languageCode}`}
                    label={label}
                    onChange={(e) => {
                        dispatch(updateItemText(languageCode, e.target.value));
                    }}
                    required={false}
                />
                <Select
                    label={`${label}:role`}
                    name={`${name}:role`}
                    required={true}
                    onChange={(e) => {
                        dispatch(
                            updateItemRole(languageCode, e.target.value as MultilingualTextItemRole)
                        );
                    }}
                >
                    {Object.values(MultilingualTextItemRole).map((role) => (
                        <MenuItem value={role} key={role}>
                            {role}
                        </MenuItem>
                    ))}
                </Select>
            </Stack>
        </AccordionDetails>
    </Accordion>
);

/**
 * TODO We need to
 * - generate one field for each available language based on a config \ backend query
 * - populate a dropbox for selecting the "role" of the text (original \ prompt \ gloss \ free translation)
 *
 */
export const MultilingualTextInput = ({
    formField: { name, label },
    onInputChange,
}: MultilingualTextInputProps): JSX.Element => {
    const [multilingualText, dispatch] = useReducer(
        multiLingualTextReducerWithNotification((propertyValue: unknown) =>
            onInputChange(name, propertyValue)
        ),
        {
            items: [],
        }
    );

    return (
        <>
            current state: {JSON.stringify(multilingualText)}
            {[
                {
                    languageCode: LanguageCode.Haida,
                    languageName: 'Haida',
                },
                {
                    languageCode: LanguageCode.Chilcotin,
                    languageName: 'Tŝilhqot’in',
                },
                {
                    languageCode: LanguageCode.English,
                    languageName: 'English',
                },
            ].map(({ languageCode, languageName }) => (
                <SingleLanguageField
                    languageCode={languageCode}
                    languageName={languageName}
                    name={name}
                    label={label}
                    dispatch={dispatch}
                />
            ))}
        </>
    );
};
