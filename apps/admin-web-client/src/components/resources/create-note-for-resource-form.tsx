import { LanguageCode } from '@coscrad/api-interfaces';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { getConfig } from '../../config';
import { LanguageSelect } from './language-select';

interface FormProps {
    resourceId: string;
    resourceType: string;
}

export const CreateNoteForResourceForm = ({ resourceId, resourceType }: FormProps) => {
    const [error, setError] = useState<Error | null>(null);

    const [text, setText] = useState('');

    const defaultLanguageCode = LanguageCode.English;

    const [languageCode, setLanguageCode] = useState<LanguageCode>(defaultLanguageCode);

    /**
     * Could pass in a callback to the component from the parent specifying its
     * own condition for enabling the form.  E.g., is the timeRange valid?
     */
    const isDisabled = text.length === 0 || !Object.values(LanguageCode).includes(languageCode);

    if (error) {
        return <div>Something went wrong!</div>;
    }

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent browser refresh

        console.log('Form Submitted Successfully:', text, languageCode, resourceId);

        const fsa = {
            type: 'CREATE_NOTE_ABOUT_RESOURCE',
            payload: {
                aggregateCompositeIdentifier: {
                    type: resourceType,
                    id: resourceId,
                },
                text: text,
                languageCode: languageCode,
            },
        };

        try {
            const response = await fetch(`${getConfig().apiUrl}/commands`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(fsa),
            });

            const result = (await response.json()) as { id: string };
        } catch (error) {
            setError(error as Error);
        }
    };

    return (
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '450px' }}>
            <div data-testid="create-note-for-resource-form" />
            <Stack>
                <TextField
                    sx={{ width: '80%' }}
                    data-testid={`text:note`}
                    onChange={(e) => {
                        setText(e.target.value);
                    }}
                ></TextField>
                <LanguageSelect
                    onSelectLanguage={(newLanguageCode: LanguageCode) => {
                        setLanguageCode(newLanguageCode);
                    }}
                />
                <Button
                    data-testid={`submit-note`}
                    variant="contained"
                    disabled={isDisabled}
                    type="submit"
                >
                    ADD NOTE
                </Button>
            </Stack>
        </Box>
    );
};
