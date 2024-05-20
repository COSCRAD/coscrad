import {
    AggregateType,
    INoteViewModel,
    ITimeRangeContext,
    ITranscript,
} from '@coscrad/api-interfaces';
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
import { TimeRangeClip, buildTimeRangeClip } from '../../timeline';
import { ImmersiveAddTranscriptItemForm } from '../shared/immersive-add-transcript-item-form';
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

const CreateAnnotationOrTranscriptItemForm = styled(Paper)({
    padding: '7px',
});

// Also in timeline.tsx
enum TimelineTrackName {
    annotations = 'annotations',
    transcriptions = 'transcriptions',
}

type TimelineTrack = {
    name: TimelineTrackName;
    trackLabel: string;
    timelineTrack: TimeRangeClip[];
};

interface InteractiveAnnotatorProps {
    id: string;
    audioURL: string;
    audioRef: RefObject<HTMLAudioElement>;
    annotations: INoteViewModel[];
    transcript: ITranscript;
}

export const InteractiveAnnotator = ({
    id,
    audioURL,
    audioRef,
    annotations,
    transcript,
}: InteractiveAnnotatorProps): JSX.Element => {
    const dispatch = useAppDispatch();

    const { mediaCurrentTimeFromContext, setMediaCurrentTimeFromContext } =
        useContext(MediaCurrentTimeContext);

    const [timeRange, setTimeRange] = useState<TimeRangeSelection | null>(null);

    const [timelineTracks, setTimelineTracks] = useState<TimelineTrack[]>([]);

    const [timelineTrackName, setTimelineTrackName] = useState(null);

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
                        name: `ann-${noteId}`,
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
            name: TimelineTrackName.annotations,
            trackLabel: 'Annotations',
            timelineTrack: annotationTimeRangeClips,
        };

        const transcriptionTimeRangeClips = transcript.items.flatMap(
            ({ inPointMilliseconds, outPointMilliseconds, text, speakerInitials }) => {
                const name = `trans-${inPointMilliseconds}`;

                const transcriptText = findOriginalTextItem(text).text;

                const tipText = `[${inPointMilliseconds} ms to ${outPointMilliseconds}] [${speakerInitials}] ${transcriptText}`;

                return [
                    buildTimeRangeClip({
                        name: `${name}`,
                        noteText: transcriptText,
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

        const transcriptTimelineTrack: TimelineTrack = {
            name: TimelineTrackName.transcriptions,
            trackLabel: 'Transcription',
            timelineTrack: transcriptionTimeRangeClips,
        };

        setTimelineTracks([annotationTimeLineTrack, transcriptTimelineTrack]);
    }, [audioRef, annotations, transcript]);

    const onAcknowledgeCommandResult = (didCommandSucceed: boolean) => {
        dispatch(clearCommandStatus());
        if (didCommandSucceed) dispatch(idUsed());
    };

    return (
        <>
            <Box>Editing Track: {timelineTrackName}</Box>
            <AudioAnnotator
                audioUrl={audioURL}
                selectedTimeRange={timeRange}
                onTimeRangeSelected={onTimeRangeSelected}
                timelineTracks={timelineTracks}
                audioRef={audioRef}
                mediaCurrentTimeFromContext={mediaCurrentTimeFromContext}
                timelineTrackName={timelineTrackName}
                setTimelineTrackName={setTimelineTrackName}
            />

            {!isNullOrUndefined(timeRange) || commandResult === Ack || errorInfo !== null ? (
                <CreateAnnotationOrTranscriptItemForm data-testid="create-transcript-item-or-note-about-audio-form">
                    {errorInfo !== null ? (
                        <NackNotification
                            _onClick={() => onAcknowledgeCommandResult(false)}
                            errorInfo={errorInfo}
                        />
                    ) : null}
                    {timelineTrackName === TimelineTrackName.annotations ? (
                        <>
                            <Box mt={1}>
                                <Typography variant="h4">Add Audio Annotation</Typography>
                                <Typography variant="body1" fontSize="3" mb={1}>
                                    Time Range in Milliseconds: {timeRange?.inPointSeconds}{' '}
                                    &lt;----&gt; {timeRange?.outPointSeconds}
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
                                                              convertTimeRangeToMilliseconds(
                                                                  timeRange
                                                              ),
                                                      }
                                                    : { type: 'general' },
                                            },
                                        })
                                    );
                                }}
                            />
                        </>
                    ) : (
                        <>
                            <Box mt={1}>
                                <Typography variant="h4">Add Transcript Item</Typography>
                                <Typography variant="body1" fontSize="3" mb={1}>
                                    Time Range in Milliseconds: {timeRange?.inPointSeconds}{' '}
                                    &lt;----&gt; {timeRange?.outPointSeconds}
                                </Typography>
                            </Box>
                            <ImmersiveAddTranscriptItemForm
                                transcriptParticipants={transcript.participants}
                                onSubmit={(text, speakerInitials, languageCode) => {
                                    const { inPointSeconds, outPointSeconds } = timeRange;

                                    setMediaCurrentTimeFromContext(outPointSeconds);

                                    dispatch(
                                        executeCommand({
                                            type: 'ADD_LINE_ITEM_TO_TRANSCRIPT',
                                            payload: {
                                                aggregateCompositeIdentifier: {
                                                    type: AggregateType.audioItem,
                                                    id,
                                                },
                                                inPointMilliseconds:
                                                    convertSecondsToMilliseconds(inPointSeconds),
                                                outPointMilliseconds:
                                                    convertSecondsToMilliseconds(outPointSeconds),
                                                text,
                                                languageCode,
                                                speakerInitials,
                                            },
                                        })
                                    );
                                }}
                            />
                        </>
                    )}
                </CreateAnnotationOrTranscriptItemForm>
            ) : null}
        </>
    );
};
