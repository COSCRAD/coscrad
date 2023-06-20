import { LanguageCode } from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { FormControl, FormGroup, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useState } from 'react';

export const CreateNoteForm = (): JSX.Element => {
    const [text, setText] = useState<string>('');

    const [languageCode, setLanguageCode] = useState<LanguageCode>(null);

    const isFormComplete =
        isNonEmptyString(text) && Object.values(LanguageCode).includes(languageCode);

    return (
        <div>
            <Typography variant="h2">Create Note</Typography>
            LanguageCode: {languageCode}
            Text: {text}
            <FormControl fullWidth>
                <FormGroup>
                    <TextField
                        id="note_text"
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
                <button
                    data-testid="submit-new-note"
                    disabled={!isFormComplete}
                    onClick={() => {
                        console.log({
                            submitting: 'note',
                            languageCode,
                            text,
                        });
                    }}
                >
                    Create
                </button>
            </FormControl>
        </div>
    );
};
