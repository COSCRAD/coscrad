import { AggregateCompositeIdentifier, AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { FormControl, FormGroup, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { buildCommandExecutor } from '../dynamic-command-execution-form';

import { Button } from '@mui/material';

type FormState = {
    text: string;
    languageCode: LanguageCode;
};

export interface CreateNoteFormProps {
    onSubmitForm: (fsa?: { type: string; payload: Record<string, unknown> }) => void;
    bindProps: Record<string, unknown>;
    aggregateCompositeIdentifier: AggregateCompositeIdentifier;
}

export const CreateNoteForm = ({ onSubmitForm, bindProps }: CreateNoteFormProps): JSX.Element => {
    const [text, setText] = useState<string>('');

    const [languageCode, setLanguageCode] = useState<LanguageCode>(null);

    const isFormComplete =
        isNonEmptyString(text) && Object.values(LanguageCode).includes(languageCode);

    return (
        <div>
            <Typography variant="h2">Create Note</Typography>
            <FormControl fullWidth>
                <FormGroup>
                    <TextField
                        id="note_text"
                        name="text"
                        label="note text"
                        value={text}
                        onChange={(e) => {
                            setText(e.target.value);
                        }}
                        multiline
                        required
                    />
                </FormGroup>
                <br />
                <FormGroup>
                    <Select
                        id="note_languageCode"
                        labelId="note_languageCode-label"
                        value={languageCode || ''}
                        label="language"
                        name="language"
                        placeholder="choose language"
                        onChange={(e) => {
                            setLanguageCode(e.target.value as LanguageCode);
                        }}
                        required
                    >
                        {Object.entries(LanguageCode).map(([languageLabel, languageCode]) => (
                            <MenuItem value={languageCode} key={languageCode}>
                                {languageLabel}
                            </MenuItem>
                        ))}
                    </Select>
                </FormGroup>
                <Button
                    disabled={!isFormComplete}
                    data-testid="submit-dynamic-form"
                    onClick={() => {
                        if (!isFormComplete) return;

                        onSubmitForm({
                            type: 'CREATE_NOTE_ABOUT_RESOURCE',
                            payload: {
                                ...bindProps,
                                resourceContext: { type: 'general' },
                                // note that the command executor injects the `aggregateCompositeIdentifier` after generating a new ID
                                languageCode,
                                text,
                            },
                        });
                    }}
                >
                    Submit
                </Button>
                {/* <button
                    data-testid="submit-new-note"
                    disabled={!isFormComplete}
                    onClick={() => {
                        console.log({
                            formState: {
                                text,
                                languageCode,
                            },
                        });

                        onSubmit({ text, languageCode });
                    }}
                >
                    Create
                </button> */}
            </FormControl>
        </div>
    );
};

export const buildCreateNoteCommandExecutor = (bindProps: Record<string, unknown>) =>
    buildCommandExecutor(
        (props: Omit<CreateNoteFormProps, 'bindProps'>): JSX.Element => (
            <CreateNoteForm {...props} bindProps={bindProps} />
        ),
        AggregateType.note
    );
