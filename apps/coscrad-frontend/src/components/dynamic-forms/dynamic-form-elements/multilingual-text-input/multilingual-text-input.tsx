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
    <Accordion data-testid={`${name}:${languageCode}`}>
        <AccordionSummary>{languageName}</AccordionSummary>
        <AccordionDetails>
            <Stack>
                <TextField
                    data-testid={`text-item-entry:${languageCode}`}
                    name={`${name}:${languageCode}`}
                    label={label}
                    onChange={(e) => {
                        dispatch(updateItemText(languageCode, e.target.value));
                    }}
                    required={false}
                />
                <Select
                    data-testid={`role-entry:${languageCode}`}
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
 * TODO Remove this as commands going forward will never direclty use `role` on the
 * form. Rather, the role will be determined by the kind of `TranslateX` command
 * that is being executed.
 *
 */
export const MultilingualTextInput = ({
    formField: { name, label },
    onInputChange,
}: MultilingualTextInputProps): JSX.Element => {
    const [_multilingualText, dispatch] = useReducer(
        multiLingualTextReducerWithNotification((propertyValue: unknown) =>
            onInputChange(name, propertyValue)
        ),
        {
            items: [],
        }
    );

    return (
        <>
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
