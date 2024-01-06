import {
    AggregateType,
    IAudioItemViewModel,
    ICategorizableDetailQueryResult,
    ResourceType,
} from '@coscrad/api-interfaces';
import { AudioAnnotator, TimeRangeSelection } from '@coscrad/media-player';
import { isNull, isNullOrUndefined } from '@coscrad/validation-constraints';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material/';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Divider,
    Grid,
    Paper,
    Typography,
    styled,
} from '@mui/material';
import { useCallback, useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { executeCommand, useLoadableCommandResult } from '../../../store/slices/command-status';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { SinglePropertyPresenter } from '../../../utils/generic-components/presenters/single-property-presenter';
import { ImmersiveCreateNoteForm } from '../shared/immersive-create-note-form';
import { convertMillisecondsToSeconds } from '../utils/math';
import { convertSecondsToMilliseconds } from '../utils/math/convert-seconds-to-milliseconds';

const convertTimeRangeSelectionToTimeRangeContext = (
    timeRangeSelection: TimeRangeSelection
): TimeRange => {
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

export type TimeRange = {
    inPointMilliseconds: number;
    outPointMilliseconds: number;
};

export const AudioItemDetailFullViewPresenter = ({
    id,
    lengthMilliseconds,
    audioURL,
    text: plainText,
    name,
}: ICategorizableDetailQueryResult<IAudioItemViewModel>): JSX.Element => {
    const dispatch = useAppDispatch();

    const { data: commandResult } = useLoadableCommandResult();

    const [timeRange, setTimeRange] = useState<TimeRange | null>(null);

    const onTimeRangeSelected = useCallback(
        (selectedTimeRange: TimeRangeSelection | null) => {
            const timeRange = convertTimeRangeSelectionToTimeRangeContext(selectedTimeRange);

            setTimeRange(timeRange);
        },
        [setTimeRange]
    );

    const formatedPlainText = plainText.split('\n').map((line, index) => (
        <Box mb={1} key={index}>
            {line}
        </Box>
    ));

    return (
        <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.audioItem}>
            <AudioAnnotator audioUrl={audioURL} onTimeRangeSelected={onTimeRangeSelected} />
            {/**
             * Get form state succeeded to clear timerange via a callback to media
             * player
             */}
            {!isNullOrUndefined(timeRange) ? (
                <CreateAnnotationForm data-testid="create-note-about-audio-form">
                    <Box mt={1}>
                        <Typography variant="h4">Add Audio Annotation</Typography>
                        <Typography variant="body1" fontSize="3" mb={1}>
                            Time Range in Milliseconds: {timeRange.inPointMilliseconds} &lt;----&gt;{' '}
                            {timeRange.outPointMilliseconds}
                        </Typography>
                    </Box>
                    <ImmersiveCreateNoteForm
                        onSubmit={(text, languageCode, noteId) =>
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
                                                  timeRange: timeRange,
                                              }
                                            : { type: 'general' },
                                    },
                                })
                            )
                        }
                    />
                </CreateAnnotationForm>
            ) : null}
            <Divider sx={{ mt: 1, mb: 1 }} />
            <Accordion elevation={0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body1" fontWeight="bold">
                        Metadata
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <SinglePropertyPresenter
                        display="Duration"
                        value={`${convertMillisecondsToSeconds(lengthMilliseconds)} secs`}
                    />
                    <SinglePropertyPresenter display="Audio Url" value={audioURL} />
                </AccordionDetails>
            </Accordion>
            <Accordion elevation={0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="body1" fontWeight="bold">
                        Transcript Text
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container columns={6} sx={{ mb: 1 }}>
                        <Grid item xs={1}>
                            {/* TODO: introduce bold (not heading) custom theme typography variant? */}
                            <Typography component={'span'} sx={{ fontWeight: 'bold' }}>
                                Text:
                            </Typography>
                        </Grid>
                        <Grid item xs={5}>
                            {formatedPlainText}
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </ResourceDetailFullViewPresenter>
    );
};
