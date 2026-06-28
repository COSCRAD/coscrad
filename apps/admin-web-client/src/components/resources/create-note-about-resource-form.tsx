import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { executeCommand } from '../command-status';
import { ErrorDisplay } from '../error-display/error-display';
import { useLoadableGeneratedId } from '../id-generation';
import { Loading } from '../loading';
import { LanguageSelect } from './language-select';

interface FormProps {
    resourceId: string;
    resourceType: string;
}

export const CreateNoteAboutResourceForm = ({ resourceId, resourceType }: FormProps) => {
    const dispatch = useAppDispatch();

    const [error, setError] = useState<Error | null>(null);

    const [text, setText] = useState('');

    const defaultLanguageCode = LanguageCode.English;

    const [languageCode, setLanguageCode] = useState<LanguageCode>(defaultLanguageCode);

    const { errorInfo, isLoading, data: generatedId } = useLoadableGeneratedId();

    if (errorInfo) return <ErrorDisplay {...errorInfo} />;

    if (isLoading) return <Loading />;

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

        console.log(
            'Form Submitted Successfully:',
            text,
            languageCode,
            `${resourceType}/${resourceId}`
        );

        dispatch(
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
            })
        );
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
