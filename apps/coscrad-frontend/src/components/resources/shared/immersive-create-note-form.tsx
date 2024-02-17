import { LanguageCode } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, Button, TextField } from '@mui/material';
import { useContext, useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import {
    Ack,
    clearCommandStatus,
    useLoadableCommandResult,
} from '../../../store/slices/command-status';
import { idUsed, useLoadableGeneratedId } from '../../../store/slices/id-generation';
import { AckNotification } from '../../commands/ack-notification';
import { NackNotification } from '../../commands/nack-notification';
import { ErrorDisplay } from '../../error-display/error-display';
import { Loading } from '../../loading';
import { LanguageSelect } from './language-select';

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

    const dispatch = useAppDispatch();

    if (errorInfo) return <ErrorDisplay {...errorInfo} />;

    if (isLoading) return <Loading />;

    const onAcknowledgeCommandResult = (didCommandSucceed: boolean) => {
        dispatch(clearCommandStatus());
        if (didCommandSucceed) dispatch(idUsed());
    };

    if (errorInfo !== null)
        return (
            <NackNotification
                _onClick={() => onAcknowledgeCommandResult(false)}
                errorInfo={errorInfo}
            />
        );

    if (commandResult === Ack)
        return <AckNotification _onClick={() => onAcknowledgeCommandResult(true)} />;

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
        </Box>
    );
};
