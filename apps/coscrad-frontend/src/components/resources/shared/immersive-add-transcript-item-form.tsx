import { ITranscriptParticipant, LanguageCode } from '@coscrad/api-interfaces';
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
import { ParticipantSelect } from './participant-select';

interface FormProps {
    transcriptParticipants: ITranscriptParticipant[];
    onSubmit: (
        text: string,
        speakerInitials: Pick<ITranscriptParticipant, 'initials'>,
        languageCode: LanguageCode,
        id: string
    ) => void;
}

export const ImmersiveAddTranscriptItemForm = ({ transcriptParticipants, onSubmit }: FormProps) => {
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

    const [speakerInitials, setSpeakerInitials] =
        useState<Pick<ITranscriptParticipant, 'initials'>>(undefined);

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
    const isDisabled = text.length === 0 || isPreviousCommandInQueue;

    return (
        <Box>
            <div data-testid="transcript-item-form" />
            <Box>
                <TextField
                    sx={{ width: '80%' }}
                    data-testid={`text:transcript-item`}
                    onChange={(e) => {
                        setText(e.target.value);
                    }}
                ></TextField>
            </Box>
            <ParticipantSelect
                onSelectParticipantInitials={(
                    initials: Pick<ITranscriptParticipant, 'initials'>
                ) => {
                    setSpeakerInitials(initials);
                }}
                transcriptParticipants={transcriptParticipants}
            />
            <LanguageSelect
                onSelectLanguage={(newLanguageCode: LanguageCode) => {
                    setLanguageCode(newLanguageCode);
                }}
            />
            <Button
                data-testid={`submit-transcript-item`}
                disabled={isDisabled}
                onClick={() => {
                    onSubmit(text, speakerInitials, languageCode, generatedId);
                }}
            >
                ADD TRANSCRIPT ITEM
            </Button>
        </Box>
    );
};
