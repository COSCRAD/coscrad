import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useExecuteCommandMutation } from '../commands/store';
import { LanguageSelect } from '../shared/language-select';

interface CreateNoteAboutResourceFormProps {
    context: {
        resourceType: string;
        resourceId: string;
    };
    generatedId: string;
    onClose: () => void;
}

export const CreateNoteAboutResourceForm = ({
    generatedId,
    context,
    onClose,
}: CreateNoteAboutResourceFormProps): JSX.Element => {
    const { resourceId, resourceType } = context;

    const [text, setText] = useState('');

    const defaultLanguageCode = LanguageCode.English;

    const [languageCode, setLanguageCode] = useState<LanguageCode>(defaultLanguageCode);

    const [executeCommand, { isLoading: isRequestInProgress, error: commandError }] =
        useExecuteCommandMutation();

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

        console.log('Form sent to server:', text, languageCode, `${resourceType}/${resourceId}`);

        executeCommand({
            type: 'CREATE_NOTE_ABOUT_RESOURCE',
            payload: {
                aggregateCompositeIdentifier: {
                    type: AggregateType.note,
                    id: generatedId,
                },
                resourceCompositeIdentifier: {
                    type: resourceType,
                    id: resourceId,
                },
                text: text,
                languageCode: languageCode,
                resourceContext: { type: 'general' },
            },
        });

        onClose();
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
