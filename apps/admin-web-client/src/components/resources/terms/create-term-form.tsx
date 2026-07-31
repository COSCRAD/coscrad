import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { LanguageSelect } from '../../shared/language-select';
import { useExecuteTermCommandMutation } from './store';

interface CreateTermFormProps {
    generatedId: string;
    onClose: () => void;
}

export const CreateTermForm = ({ generatedId, onClose }: CreateTermFormProps): JSX.Element => {
    const [text, setText] = useState('');

    const [languageCode, setLanguageCode] = useState<LanguageCode>();

    const [executeTermCommand, { isLoading: isRequestInProgress, error: commandError }] =
        useExecuteTermCommandMutation();

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

    const isDisabled = text.length === 0 || !Object.values(LanguageCode).includes(languageCode);

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent browser refresh

        console.log('Form sent to server:', text, languageCode);

        executeTermCommand({
            type: 'CREATE_TERM',
            payload: {
                aggregateCompositeIdentifier: {
                    type: AggregateType.term,
                    id: generatedId,
                },
                text: text,
                languageCode: languageCode,
            },
        });

        setTimeout(() => {
            executeTermCommand({
                type: 'PUBLISH_RESOURCE',
                payload: {
                    aggregateCompositeIdentifier: {
                        type: AggregateType.term,
                        id: generatedId,
                    },
                },
            });
        }, 600);

        onClose();
    };

    return (
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '450px' }}>
            <div data-testid="create-term-form" />
            <Stack>
                <TextField
                    sx={{ width: '80%' }}
                    data-testid={`text`}
                    onChange={(e) => {
                        setText(e.target.value);
                    }}
                ></TextField>
                <LanguageSelect
                    languageCodesInUse={[]}
                    onSelectLanguage={(newLanguageCode: LanguageCode) => {
                        setLanguageCode(newLanguageCode);
                    }}
                />
                <Button
                    data-testid={`submit-term`}
                    variant="contained"
                    disabled={isDisabled}
                    type="submit"
                >
                    CREATE TERM
                </Button>
            </Stack>
        </Box>
    );
};
