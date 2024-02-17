import { AggregateType, INoteViewModel, ITimeRangeContext } from '@coscrad/api-interfaces';
import { AudioAnnotator, TimeRangeSelection } from '@coscrad/media-player';
import { isNull, isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, Paper, Typography, styled } from '@mui/material';
import { RefObject, useCallback, useContext, useEffect, useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import {
    Ack,
    clearCommandStatus,
    executeCommand,
    useLoadableCommandResult,
} from '../../../store/slices/command-status/';
import { idUsed } from '../../../store/slices/id-generation';
import { NackNotification } from '../../commands/nack-notification';
import { findOriginalTextItem } from '../../notes/shared/find-original-text-item';
import { TimelineTrack, buildTimeRangeClip } from '../../timeline';
import { ImmersiveCreateNoteForm } from '../shared/immersive-create-note-form';
import { MediaCurrentTimeContext } from '../shared/media-currenttime-provider';
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
    annotations: INoteViewModel[];
}

export const InteractiveAnnotator = ({
    id,
    audioURL,
    audioRef,
    annotations,
}: InteractiveAnnotatorProps): JSX.Element => {
    const dispatch = useAppDispatch();

    const { mediaCurrentTimeFromContext, setMediaCurrentTimeFromContext } =
        useContext(MediaCurrentTimeContext);

    const [timeRange, setTimeRange] = useState<TimeRangeSelection | null>(null);

    const [timelineTracks, setTimelineTracks] = useState<TimelineTrack[]>([]);

    const onTimeRangeSelected = useCallback((selectedTimeRange: TimeRangeSelection | null) => {
        setTimeRange(selectedTimeRange);
    }, []);

    const { data: commandResult, errorInfo } = useLoadableCommandResult();

    useEffect(() => {
        if (errorInfo === null && commandResult !== Ack) {
            setTimeRange(null);

            if (!isNull(mediaCurrentTimeFromContext)) {
                audioRef.current.currentTime = mediaCurrentTimeFromContext;
            }
        }
    }, [setTimeRange, errorInfo, commandResult, audioRef, mediaCurrentTimeFromContext]);

    useEffect(() => {
        if (isNullOrUndefined(audioRef.current.currentTime)) return;

        const annotationTimeRangeClips = annotations.flatMap(
            ({ connectedResources, note, id: noteId }) => {
                const timeRangeContext = connectedResources[0].context as ITimeRangeContext;

                const {
                    timeRange: { inPointMilliseconds, outPointMilliseconds },
                } = timeRangeContext;

                const noteOriginal = findOriginalTextItem(note).text;

                const tipText = `[${inPointMilliseconds} ms to ${outPointMilliseconds}] ${noteOriginal}`;

                /**
                 * Should we break this logic out so we can share it for
                 * video annotation?
                 */
                return [
                    buildTimeRangeClip({
                        name: `${noteId}`,
                        noteText: noteOriginal,
                        tip: tipText,
                        inPointMilliseconds: inPointMilliseconds,
                        outPointMilliseconds: outPointMilliseconds,
                        onClick: (inPointSeconds) => {
                            audioRef.current.currentTime = inPointSeconds;
                        },
                    }),
                ];
            }
        );

        const annotationTimeLineTrack: TimelineTrack = {
            trackLabel: 'Annotations',
            timelineTrack: annotationTimeRangeClips,
        };

        setTimelineTracks([annotationTimeLineTrack]);
    }, [audioRef, annotations]);

    const onAcknowledgeCommandResult = (didCommandSucceed: boolean) => {
        dispatch(clearCommandStatus());
        if (didCommandSucceed) dispatch(idUsed());
    };

    return (
        <>
            {/* <Stack>
                {timeRangeClips.map((clip) => (
                    <div>{clip.label}</div>
                ))}
            </Stack> */}
            <AudioAnnotator
                audioUrl={audioURL}
                selectedTimeRange={timeRange}
                onTimeRangeSelected={onTimeRangeSelected}
                timelineTracks={timelineTracks}
                audioRef={audioRef}
                mediaCurrentTimeFromContext={mediaCurrentTimeFromContext}
            />

            {!isNullOrUndefined(timeRange) || commandResult === Ack || errorInfo !== null ? (
                <CreateAnnotationForm data-testid="create-note-about-audio-form">
                    {errorInfo !== null ? (
                        <NackNotification
                            _onClick={() => onAcknowledgeCommandResult(false)}
                            errorInfo={errorInfo}
                        />
                    ) : null}
                    <Box mt={1}>
                        <Typography variant="h4">Add Audio Annotation</Typography>
                        <Typography variant="body1" fontSize="3" mb={1}>
                            Time Range in Milliseconds: {timeRange?.inPointSeconds} &lt;----&gt;{' '}
                            {timeRange?.outPointSeconds}
                        </Typography>
                    </Box>
                    <ImmersiveCreateNoteForm
                        onSubmit={(text, languageCode, noteId) => {
                            setMediaCurrentTimeFromContext(timeRange.outPointSeconds);

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
