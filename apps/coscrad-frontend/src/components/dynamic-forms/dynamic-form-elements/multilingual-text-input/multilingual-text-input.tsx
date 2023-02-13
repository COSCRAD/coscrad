import {
    IFormField,
    IMultiLingualText,
    LanguageCode,
    MultiLingualTextItemRole,
} from '@coscrad/api-interfaces';
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
import { multiLingualTextReducerWtihNotification } from './actions/multilingual-text-form-reducer';
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
    languageId: LanguageCode;
    languageName: string;
    onInputChange: OnInputChange;
    formState: IMultiLingualText;
    dispatch: React.Dispatch<unknown>;
}

const SingleLanguageField = ({
    name,
    label,
    languageId,
    languageName,
    onInputChange,
    formState,
    dispatch,
}: SingleLanguageFieldProps) => (
    <Accordion>
        <AccordionSummary>{languageName}</AccordionSummary>
        <AccordionDetails>
            <Stack>
                <TextField
                    name={`${name}:${languageId}`}
                    label={label}
                    onChange={(e) => {
                        dispatch(updateItemText(languageId, e.target.value));

                        onInputChange(name, formState);
                    }}
                    required={false}
                />
                <Select
                    label={`${label}:role`}
                    name={`${name}:role`}
                    required={true}
                    onChange={(e) => {
                        dispatch(
                            updateItemRole(languageId, e.target.value as MultiLingualTextItemRole)
                        );

                        onInputChange(name, formState);
                    }}
                >
                    {Object.values(MultiLingualTextItemRole).map((role) => (
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
        multiLingualTextReducerWtihNotification((propertyValue: unknown) =>
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
                    languageId: LanguageCode.haida,
                    languageName: 'Haida',
                },
                {
                    languageId: LanguageCode.chilcotin,
                    languageName: 'Tŝilhqot’in',
                },
                {
                    languageId: LanguageCode.english,
                    languageName: 'English',
                },
            ].map(({ languageId, languageName }) => (
                <SingleLanguageField
                    languageId={languageId}
                    languageName={languageName}
                    name={name}
                    label={label}
                    formState={multilingualText}
                    dispatch={dispatch}
                    onInputChange={onInputChange}
                />
            ))}
        </>
    );
};
