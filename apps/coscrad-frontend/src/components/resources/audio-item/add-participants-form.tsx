import { ITranscriptParticipant } from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Button, FormGroup, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import {
    clearCommandStatus,
    executeCommand,
    useLoadableCommandResult,
} from '../../../store/slices/command-status';
import { idUsed } from '../../../store/slices/id-generation';
import { AckNotification } from '../../commands/ack-notification';
import { NackNotification } from '../../commands/nack-notification';
import { Loading } from '../../loading';

export interface AddParticipantsFormProps {
    aggregateCompositeIdentifier;
    existingParticipants: ITranscriptParticipant[];
}

export const AddParticipantsForm = ({
    aggregateCompositeIdentifier,
    existingParticipants,
}: AddParticipantsFormProps) => {
    const dispatch = useAppDispatch();

    const [initials, setInitials] = useState('');

    const [name, setName] = useState('');

    const { isLoading, errorInfo, data: previousCommandResult } = useLoadableCommandResult();

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

    if (previousCommandResult === 'Ack') {
        return <AckNotification _onClick={() => onAcknowledgeCommandResult(true)} />;
    }

    const isComplete = [name, initials].every((value) => isNonEmptyString(value));

    const isNewParticipant = !existingParticipants.some(
        (existingParticipant) =>
            existingParticipant.initials === initials || existingParticipant.name === name
    );

    const canSubmit = isComplete && isNewParticipant;

    return (
        <FormGroup>
            {!isComplete ? (
                <Typography variant="body1">Please complete the form.</Typography>
            ) : null}
            {!isNewParticipant ? (
                <Typography variant="body1">
                    Participant name and initials must not match those of an existing participant.
                </Typography>
            ) : null}
            <TextField
                data-testid={`text:add-participants:name`}
                name={`participant-name`}
                label="Participant Name"
                onChange={(e) => {
                    setName(e.target.value);
                }}
            />
            <TextField
                data-testid={`text:add-participants:initials`}
                name={`participant-initials`}
                label="Participant Initials"
                onChange={(e) => {
                    setInitials(e.target.value);
                }}
            />
            <Button
                disabled={!canSubmit}
                onClick={() => {
                    dispatch(
                        executeCommand({
                            type: `ADD_PARTICIPANT_TO_TRANSCRIPT`,
                            payload: {
                                aggregateCompositeIdentifier,
                                name,
                                initials,
                            },
                        })
                    );
                }}
            >
                ADD PARTICIPANT
            </Button>
        </FormGroup>
    );
};
