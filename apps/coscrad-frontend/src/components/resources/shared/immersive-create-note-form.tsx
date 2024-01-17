import { LanguageCode } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, Button, TextField } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { Ack, useLoadableCommandResult } from '../../../store/slices/command-status';
import { useLoadableGeneratedId } from '../../../store/slices/id-generation';
import { ErrorDisplay } from '../../error-display/error-display';
import { Loading } from '../../loading';
import { UIFeedback } from '../utils/ui-feedback';
import { LanguageSelect } from './language-select';

const acknowledgeResultFeedback = [
    'Please acknowledge the outcome of the previous command below to',
    'open the annotation form.',
].join(' ');

interface FormProps {
    onSubmit: (text: string, languageCode: LanguageCode, id: string) => void;
}

export const ImmersiveCreateNoteForm = ({ onSubmit }: FormProps) => {
    const {
        isLoading: isAnotherCommandPending,
        errorInfo: previousCommandErrorInfo,
        data: commandResult,
    } = useLoadableCommandResult();

    const isPreviousCommandInQueue =
        isAnotherCommandPending ||
        !isNullOrUndefined(previousCommandErrorInfo) ||
        !isNullOrUndefined(commandResult);

    const [text, setText] = useState('');

    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const [languageCode, setLanguageCode] = useState<LanguageCode>(defaultLanguageCode);

    const { errorInfo, isLoading, data: generatedId } = useLoadableGeneratedId();

    // TODO: research this pattern to see if it can be improved
    useEffect(() => {
        if (commandResult === Ack) {
            setText('');
            setLanguageCode(LanguageCode.English);
        }
    }, [commandResult, setText, setLanguageCode]);

    if (errorInfo) return <ErrorDisplay {...errorInfo} />;

    if (isLoading) return <Loading />;

    /**
     * Could pass in a callback to the component from the parent specifying its
     * own condition for enabling the form.  E.g., is the timeRange valid?
     */
    const isDisabled =
        text.length === 0 ||
        !Object.values(LanguageCode).includes(languageCode) ||
        isPreviousCommandInQueue;

    return (
        <Box>
            {/* TODO Style this as a validation warning */}
            {isPreviousCommandInQueue ? (
                <UIFeedback feedbackMessage={acknowledgeResultFeedback} />
            ) : (
                <>
                    <div data-testid="note-form" />
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
                        disabled={isDisabled}
                        onClick={() => {
                            onSubmit(text, languageCode, generatedId);
                        }}
                    >
                        ADD NOTE
                    </Button>
                </>
            )}
        </Box>
    );
};
