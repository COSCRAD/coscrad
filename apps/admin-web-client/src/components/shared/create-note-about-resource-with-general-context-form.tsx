import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useExecuteTermCommandMutation } from '../resources/terms/store';
import { LanguageSelect } from './language-select';

interface CreateNoteAboutResourceFormProps {
    context: {
        resourceType: string;
        resourceId: string;
    };
    generatedId: string;
    onClose: () => void;
}

export const CreateNoteAboutResourceWithGeneralContextForm = ({
    generatedId,
    context,
    onClose,
}: CreateNoteAboutResourceFormProps): JSX.Element => {
    const { resourceId, resourceType } = context;

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

        console.log(
            'Form sent to server:',
            text,
            languageCode,
            `${resourceType}/${resourceId}`,
            `generatedId: ${generatedId}`
        );

        executeTermCommand({
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
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '95%' }}>
            <div data-testid="create-note-for-resource-form" />
            <Stack>
                <TextField
                    data-testid={`text:note`}
                    multiline
                    rows={4}
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
