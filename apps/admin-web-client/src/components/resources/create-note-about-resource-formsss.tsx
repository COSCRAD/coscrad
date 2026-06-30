import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useExecuteCommandMutation } from '../command-status/store';
import { useFetchIdQuery } from '../id-generation/store';
import { LanguageSelect } from './language-select';

interface FormProps {
    resourceId: string;
    resourceType: string;
}

export const CreateNoteAboutResourceForm = ({ resourceId, resourceType }: FormProps) => {
    // const dispatch = useAppDispatch();

    const [text, setText] = useState('');

    const defaultLanguageCode = LanguageCode.English;

    const [languageCode, setLanguageCode] = useState<LanguageCode>(defaultLanguageCode);

    const { data: idData, isLoading: idIsLoading, error: idError } = useFetchIdQuery();

    console.log({ idData });

    const [executeCommand, { isLoading: isRequestInProgress, error: commandError }] =
        useExecuteCommandMutation();

    if (idError) {
        if ('status' in idError) {
            // you can access all properties of `FetchBaseQueryError` here
            const errMsg = 'error' in idError ? idError.error : JSON.stringify(idError.data);

            return (
                <div>
                    <div>An error has occurred:</div>
                    <div>{errMsg}</div>
                </div>
            );
        }
        // you can access all properties of `SerializedError` here
        return <div>{idError.message}</div>;
    }

    if (idIsLoading || !idData) {
        return <div>Loading Id...</div>;
    }

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

    /**
     * Could pass in a callback to the component from the parent specifying its
     * own condition for enabling the form.  E.g., is the timeRange valid?
     */
    const isDisabled = text.length === 0 || !Object.values(LanguageCode).includes(languageCode);

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent browser refresh

        console.log('Form sent to server:', text, languageCode, `${resourceType}/${resourceId}`);

        executeCommand({
            type: 'CREATE_NOTE_ABOUT_RESOURCE',
            payload: {
                aggregateCompositeIdentifier: {
                    type: AggregateType.note,
                    id: idData,
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
