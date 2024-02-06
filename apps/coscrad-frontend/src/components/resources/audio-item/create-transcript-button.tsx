import { AggregateType } from '@coscrad/api-interfaces';
import { Button } from '@mui/material';
import { useAppDispatch } from '../../../app/hooks';
import {
    Ack,
    clearCommandStatus,
    executeCommand,
    useLoadableCommandResult,
} from '../../../store/slices/command-status';
import { idUsed } from '../../../store/slices/id-generation';
import { AckNotification } from '../../commands/ack-notification';
import { NackNotification } from '../../commands/nack-notification';
import { Loading } from '../../loading';

export interface CreateTranscriptButtonProps {
    aggregateCompositeIdentifier: {
        type: AggregateType;
        id: string;
    };
}

export const CreateTranscriptButton = ({
    aggregateCompositeIdentifier,
}: CreateTranscriptButtonProps) => {
    const dispatch = useAppDispatch();

    const { isLoading, errorInfo, data: commandResult } = useLoadableCommandResult();

    const onAcknowledgeCommandResult = (didCommandSucceed: boolean) => {
        dispatch(clearCommandStatus());
        if (didCommandSucceed) dispatch(idUsed());
    };

    if (isLoading) {
        return <Loading />;
    }

    if (errorInfo !== null)
        return (
            <NackNotification
                _onClick={() => onAcknowledgeCommandResult(false)}
                errorInfo={errorInfo}
            />
        );

    if (commandResult === Ack)
        return <AckNotification _onClick={() => onAcknowledgeCommandResult(true)} />;

    return (
        <Button
            onClick={() => {
                dispatch(
                    executeCommand({
                        type: `CREATE_TRANSCRIPT`,
                        payload: {
                            aggregateCompositeIdentifier,
                        },
                    })
                );
            }}
        >
            Create Transcript
        </Button>
    );
};
