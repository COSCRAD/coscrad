import { LanguageCode } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useLoadableCommandResult } from '../../../store/slices/command-status';
import { useLoadableGeneratedId } from '../../../store/slices/id-generation';
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

    const [languageCode, setLanguageCode] = useState<LanguageCode>(null);

    const { errorInfo, isLoading, data: generatedId } = useLoadableGeneratedId();

    if (errorInfo) return <ErrorDisplay {...errorInfo} />;

    if (isLoading) return <Loading />;

    const isDisabled =
        text.length === 0 ||
        !Object.values(LanguageCode).includes(languageCode) ||
        isPreviousCommandInQueue;

    return (
        <>
            <div>
                {/* TODO Style this as a validation warning */}
                {isPreviousCommandInQueue ? (
                    <Typography variant="body1">
                        Please acknowledge the outcome of the previous command.
                    </Typography>
                ) : null}
            </div>
            <TextField
                data-testid={`text:create-note`}
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
                disabled={isDisabled}
                onClick={() => {
                    onSubmit(text, languageCode, generatedId);
                }}
            >
                ADD NOTE
            </Button>
        </>
    );
};
