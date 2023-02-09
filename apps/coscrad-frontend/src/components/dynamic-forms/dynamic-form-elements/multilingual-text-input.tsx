import { IFormField } from '@coscrad/api-interfaces';
import { Accordion, AccordionDetails, AccordionSummary, TextField } from '@mui/material';
import { useFormState } from '../form-state';

type OnInputChange = (name: string, value: unknown) => void;

interface MultilingualTextInputProps {
    formField: IFormField;
    onInputChange?: OnInputChange;
    required: boolean;
}

interface SingleLanguageFieldProps {
    name: string;
    label: string;
    languageId: string;
    languageName: string;
    currentFormValue: Record<string, unknown>;
    onInputChange: OnInputChange;
}

const SingleLanguageField = ({
    name,
    label,
    languageId,
    languageName,
    currentFormValue,
    onInputChange,
}: SingleLanguageFieldProps) => (
    <Accordion>
        <AccordionSummary>{languageName}</AccordionSummary>
        <AccordionDetails>
            <div>
                <TextField
                    name={`${name}:${languageId}`}
                    label={label}
                    onChange={(e) => {
                        const newItem = {
                            languageId: languageId,
                            text: e.target.value,
                            role: 'original',
                        };

                        console.log({ currentFormValue });

                        // TODO type safety!
                        const multiLingualTextValue = {
                            items: [
                                // TODO fix types
                                ...(currentFormValue.items as { languageId: string }[]).filter(
                                    (item) => item.languageId !== languageId
                                ),
                                newItem,
                            ],
                        };

                        console.log({ multiLingualTextValue });

                        onInputChange(name, multiLingualTextValue);

                        // updateCurrentValue('items', multiLingualTextValue.items);
                    }}
                    required={false}
                />
            </div>
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
    const [currentValue, updateCurrentValue] = useFormState({
        items: [],
    });

    const onInputChangeWithStateUpdate = (name: string, value: unknown) => {
        onInputChange(name, value);

        updateCurrentValue('items', (value as { items: Array<unknown> }).items);
    };

    return (
        <>
            {[
                {
                    languageId: 'hai',
                    languageName: 'Haida',
                },
                {
                    languageId: 'clc',
                    languageName: 'Tŝilhqot’in',
                },
                {
                    languageId: 'eng',
                    languageName: 'English',
                },
            ].map(({ languageId, languageName }) => (
                <SingleLanguageField
                    languageId={languageId}
                    languageName={languageName}
                    onInputChange={onInputChangeWithStateUpdate}
                    name={name}
                    label={label}
                    currentFormValue={currentValue}
                />
            ))}
        </>
    );
};
