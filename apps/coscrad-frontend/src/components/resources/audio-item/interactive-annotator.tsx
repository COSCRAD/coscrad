import { AggregateType, INoteViewModel, ITimeRangeContext } from '@coscrad/api-interfaces';
import { AudioAnnotator, TimeRangeSelection } from '@coscrad/media-player';
import { isNull, isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, Paper, Typography, styled } from '@mui/material';
import { RefObject, useCallback, useContext, useEffect, useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import {
    Ack,
    executeCommand,
    useLoadableCommandResult,
} from '../../../store/slices/command-status/';
import { findOriginalTextItem } from '../../notes/shared/find-original-text-item';
import { TimeRangeClip, buildTimeRangeClip } from '../../timeline';
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

    const [timeRangeClips, setTimeRangeClips] = useState<TimeRangeClip[]>([]);

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
        const updatedTimeRangeClips = isNullOrUndefined(audioRef?.current?.currentTime)
            ? []
            : annotations.flatMap(({ connectedResources, note, id: noteId }) => {
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
              });

        setTimeRangeClips(updatedTimeRangeClips);
    }, [audioRef, annotations]);

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
                timeRangeClips={timeRangeClips}
                audioRef={audioRef}
                mediaCurrentTimeFromContext={mediaCurrentTimeFromContext}
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
