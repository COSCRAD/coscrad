import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { LanguageSelect } from '../../shared/language-select';
import { useTranslateTermMutation } from './store';

interface TranslateTermFormProps {
    context: {
        resourceType: ResourceType;
        resourceId: string;
    };
    onClose: () => void;
}

export const TranslateTermForm = ({ context, onClose }: TranslateTermFormProps): JSX.Element => {
    const { resourceId: termId, resourceType } = context;

    const [translation, setTranslation] = useState('');

    const defaultLanguageCode = LanguageCode.English;

    const [languageCode, setLanguageCode] = useState<LanguageCode>(defaultLanguageCode);

    const [executeCommand, { isLoading: isRequestInProgress, error: commandError }] =
        useTranslateTermMutation();

    if (isRequestInProgress) {
        return <div>Processing Command Request...</div>;
    }

    if (commandError) {
        if ('status' in commandError) {
            // you can access all properties of `FetchBaseQueryError` here
            const errMsg =
                'error' in commandError ? commandError.error : JSON.stringify(commandError.data);

            return (
                <div>
                    <div>An error with the command request has occurred:</div>
                    <div>{errMsg}</div>
                </div>
            );
        }
        // you can access all properties of `SerializedError` here
        return <div>Command Error: {commandError.message}</div>;
    }

    const isDisabled =
        translation.length === 0 || !Object.values(LanguageCode).includes(languageCode);

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent browser refresh

        console.log('Form sent to server:', translation, languageCode, `${resourceType}/${termId}`);

        executeCommand({
            type: 'TRANSLATE_TERM',
            payload: {
                aggregateCompositeIdentifier: {
                    type: AggregateType.term,
                    id: termId,
                },
                translation: translation,
                languageCode: languageCode,
            },
        });

        onClose();
    };

    return (
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '450px' }}>
            <div data-testid="translate-term-form" />
            <Stack>
                <TextField
                    sx={{ width: '80%' }}
                    data-testid={`translation`}
                    onChange={(e) => {
                        setTranslation(e.target.value);
                    }}
                ></TextField>
                <LanguageSelect
                    onSelectLanguage={(newLanguageCode: LanguageCode) => {
                        setLanguageCode(newLanguageCode);
                    }}
                />
                <Button
                    data-testid={`submit-translation`}
                    variant="contained"
                    disabled={isDisabled}
                    type="submit"
                >
                    TRANSLATE TERM
                </Button>
            </Stack>
        </Box>
    );
};
