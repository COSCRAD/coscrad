import { AggregateCompositeIdentifier, AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import {
    Box,
    FormControl,
    FormGroup,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useState } from 'react';
import { buildCommandExecutor } from '../command-executor';

import { Button } from '@mui/material';

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
        <Box>
            <Typography variant="h2">Create Note</Typography>
            <FormControl fullWidth>
                <Stack>
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
                    <FormGroup>
                        <Select
                            id="note_languageCode"
                            labelId="note_languageCode-label"
                            value={languageCode || ''}
                            label="language"
                            name="language"
                            placeholder="Choose Language"
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
                                    /**
                                     * TODO [https://www.pivotaltracker.com/story/show/185475141]
                                     * We need to support the selection of non-trivial context.
                                     */
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
                </Stack>
            </FormControl>
        </Box>
    );
};

export const buildCreateNoteCommandExecutor = (bindProps: Record<string, unknown>) =>
    buildCommandExecutor(
        (props: Omit<CreateNoteFormProps, 'bindProps'>): JSX.Element => (
            <CreateNoteForm {...props} bindProps={bindProps} />
        ),
        AggregateType.note
    );
