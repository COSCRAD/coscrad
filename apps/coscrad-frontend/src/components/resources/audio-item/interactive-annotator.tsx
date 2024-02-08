import { AggregateType } from '@coscrad/api-interfaces';
import { AudioAnnotator, TimeRangeSelection } from '@coscrad/media-player';
import { isNull, isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, Paper, Typography, styled } from '@mui/material';
import { RefObject, useCallback, useEffect, useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import {
    Ack,
    executeCommand,
    useLoadableCommandResult,
} from '../../../store/slices/command-status/';
import { ImmersiveCreateNoteForm } from '../shared/immersive-create-note-form';
import { convertSecondsToMilliseconds } from '../utils/math/convert-seconds-to-milliseconds';

export type TimeRangeMilliseconds = {
    inPointMilliseconds: number;
    outPointMilliseconds: number;
};

const convertTimeRangeToMilliseconds = (
    timeRangeSelection: TimeRangeSelection
): TimeRangeMilliseconds => {
    if (isNullOrUndefined(timeRangeSelection)) return;

    const { inPointSeconds, outPointSeconds } = timeRangeSelection;

    const inPointMilliseconds = convertSecondsToMilliseconds(inPointSeconds);

    const outPointMilliseconds = convertSecondsToMilliseconds(outPointSeconds);

    return {
        inPointMilliseconds: inPointMilliseconds,
        outPointMilliseconds: outPointMilliseconds,
    };
};

const CreateAnnotationForm = styled(Paper)({
    padding: '7px',
});

interface InteractiveAnnotatorProps {
    id: string;
    audioURL: string;
    audioRef: RefObject<HTMLAudioElement>;
}

export const InteractiveAnnotator = ({
    id,
    audioURL,
    audioRef,
}: InteractiveAnnotatorProps): JSX.Element => {
    const dispatch = useAppDispatch();

    const [timeRange, setTimeRange] = useState<TimeRangeSelection | null>(null);

    const onTimeRangeSelected = useCallback((selectedTimeRange: TimeRangeSelection | null) => {
        setTimeRange(selectedTimeRange);
    }, []);

    const { data: commandResult, errorInfo } = useLoadableCommandResult();

    useEffect(() => {
        if (errorInfo === null && commandResult !== Ack) setTimeRange(null);
    }, [setTimeRange, errorInfo, commandResult]);

    return (
        <>
            <AudioAnnotator
                audioUrl={audioURL}
                selectedTimeRange={timeRange}
                onTimeRangeSelected={onTimeRangeSelected}
                audioRef={audioRef}
            />

            {!isNullOrUndefined(timeRange) || commandResult === Ack ? (
                <CreateAnnotationForm data-testid="create-note-about-audio-form">
                    <Box mt={1}>
                        <Typography variant="h4">Add Audio Annotation</Typography>
                        <Typography variant="body1" fontSize="3" mb={1}>
                            Time Range in Milliseconds: {timeRange?.inPointSeconds} &lt;----&gt;{' '}
                            {timeRange?.outPointSeconds}
                        </Typography>
                    </Box>
                    <ImmersiveCreateNoteForm
                        onSubmit={(text, languageCode, noteId) => {
                            dispatch(
                                executeCommand({
                                    type: 'CREATE_NOTE_ABOUT_RESOURCE',
                                    payload: {
                                        aggregateCompositeIdentifier: {
                                            type: AggregateType.note,
                                            id: noteId,
                                        },
                                        resourceCompositeIdentifier: {
                                            type: AggregateType.audioItem,
                                            id,
                                        },
                                        text,
                                        languageCode,
                                        resourceContext: !isNull(timeRange)
                                            ? {
                                                  type: 'timeRange',
                                                  timeRange:
                                                      convertTimeRangeToMilliseconds(timeRange),
                                              }
                                            : { type: 'general' },
                                    },
                                })
                            );
                        }}
                    />
                </CreateAnnotationForm>
            ) : null}
        </>
    );
};
