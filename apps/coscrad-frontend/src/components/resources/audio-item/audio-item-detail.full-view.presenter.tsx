import {
    AggregateType,
    IAudioItemViewModel,
    ICategorizableDetailQueryResult,
    ResourceType,
} from '@coscrad/api-interfaces';
import { AudioAnnotator, AudioPlayer, TimeRangeSelection } from '@coscrad/media-player';
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
import { useState } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { executeCommand } from '../../../store/slices/command-status';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { SinglePropertyPresenter } from '../../../utils/generic-components/presenters/single-property-presenter';
import { ImmersiveCreateNoteForm } from '../shared/immersive-create-note-form';
import { convertMillisecondsToSeconds } from '../utils/math';
import { convertSecondsToMilliseconds } from '../utils/math/convert-seconds-to-milliseconds';

const CREATE_NOTE_ABOUT_RESOURCE = 'CREATE_NOTE_ABOUT_RESOURCE';

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

export type TimeRangeMilliseconds = {
    inPointMilliseconds: number;
    outPointMilliseconds: number;
};

export const AudioItemDetailFullViewPresenter = ({
    id,
    lengthMilliseconds,
    audioURL,
    text: plainText,
    name,
    actions,
}: ICategorizableDetailQueryResult<IAudioItemViewModel>): JSX.Element => {
    const dispatch = useAppDispatch();

    const [timeRange, setTimeRange] = useState<TimeRangeSelection | null>(null);

    const onTimeRangeSelected = (selectedTimeRange: TimeRangeSelection | null) => {
        setTimeRange(selectedTimeRange);
    };

    const formatedPlainText = plainText.split('\n').map((line, index) => (
        <Box mb={1} key={index}>
            {line}
        </Box>
    ));

    return (
        <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.audioItem}>
            {actions.some(({ type: commandType }) => commandType === CREATE_NOTE_ABOUT_RESOURCE) ? (
                <>
                    <AudioAnnotator
                        audioUrl={audioURL}
                        selectedTimeRange={timeRange}
                        onTimeRangeSelected={onTimeRangeSelected}
                    />

                    {!isNullOrUndefined(timeRange) ? (
                        <CreateAnnotationForm data-testid="create-note-about-audio-form">
                            <Box mt={1}>
                                <Typography variant="h4">Add Audio Annotation</Typography>
                                <Typography variant="body1" fontSize="3" mb={1}>
                                    Time Range in Milliseconds: {timeRange?.inPointSeconds}{' '}
                                    &lt;----&gt; {timeRange?.outPointSeconds}
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
                                                              convertTimeRangeToMilliseconds(
                                                                  timeRange
                                                              ),
                                                      }
                                                    : { type: 'general' },
                                            },
                                        })
                                    );

                                    setTimeRange(null);
                                }}
                            />
                        </CreateAnnotationForm>
                    ) : null}
                </>
            ) : (
                <AudioPlayer audioUrl={audioURL} />
            )}

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
