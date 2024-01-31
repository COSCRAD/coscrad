import {
    EdgeConnectionContextType,
    IAudioItemViewModel,
    ICategorizableDetailQueryResult,
    ITimeRangeContext,
    ResourceType,
} from '@coscrad/api-interfaces';
import { AudioPlayer } from '@coscrad/media-player';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material/';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Divider,
    Grid,
    Slider,
    SliderProps,
    Tooltip,
    Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { SinglePropertyPresenter } from '../../../utils/generic-components/presenters/single-property-presenter';
import { TranscriptPresenter } from '../../transcripts/transcript-presenter';
import { convertMillisecondsToSeconds } from '../utils/math';
import { InteractiveAnnotator } from './interactive-annotator';

interface NoteTimelineLabelProps {
    inOrOut: 'in' | 'out';
    inPointMilliseconds: number;
    outPointMilliseconds: number;
    text: string;
    onClick: (timePoint: number) => void;
}

const NoteTimelineLabel = ({
    inOrOut,
    inPointMilliseconds,
    outPointMilliseconds,
    text,
    onClick,
}: NoteTimelineLabelProps): JSX.Element => {
    const icon = inOrOut === 'in' ? '<-' : '->';

    const relevantTimePoint = inOrOut === 'in' ? inPointMilliseconds : outPointMilliseconds;

    const SECONDS_PER_MILISECOND = 1 / 1000;

    const handleClick = () => {
        onClick(relevantTimePoint * SECONDS_PER_MILISECOND);
    };

    return (
        <Tooltip title={`[${inPointMilliseconds},${outPointMilliseconds}] ${text}`}>
            <div onClick={handleClick}>{icon}</div>
        </Tooltip>
    );
};

const CREATE_NOTE_ABOUT_RESOURCE = 'CREATE_NOTE_ABOUT_RESOURCE';

const buildDummyContext = (lengthMilliseconds, numberOfNotes): ITimeRangeContext[] =>
    Array(numberOfNotes)
        .fill(0)
        .map((_, index) => {
            const padding = index === 0 ? 0 : 150; // ms between in and out points

            const inPointMilliseconds = (lengthMilliseconds * index) / numberOfNotes + padding;

            const outPointMilliseconds =
                inPointMilliseconds + lengthMilliseconds / numberOfNotes - padding;

            return {
                type: EdgeConnectionContextType.timeRange,
                timeRange: {
                    inPointMilliseconds,
                    outPointMilliseconds,
                },
            };
        });

// TODO expose a COSCRAD API + adapter to MUI Slider
const buildDummyMarks = (length, numberOfMarks): SliderProps['marks'] =>
    Array(numberOfMarks)
        .fill(0)
        .map((_, index) => ({
            value: index * (length / (numberOfMarks || 1)),
            label: `Mark ${index}`,
        }));

const convertAnnotationToMarks = (
    name: string,
    { timeRange: { inPointMilliseconds, outPointMilliseconds } }: ITimeRangeContext,
    onClick: (timeStamp) => void
) => [
    {
        value: inPointMilliseconds,
        label: NoteTimelineLabel({
            inOrOut: 'in',
            inPointMilliseconds,
            outPointMilliseconds,
            text: name,
            onClick,
        }),
    },
    {
        value: outPointMilliseconds,
        label: NoteTimelineLabel({
            inOrOut: 'out',
            inPointMilliseconds,
            outPointMilliseconds,
            text: name,
            onClick,
        }),
    },
];

export const AudioItemDetailFullViewPresenter = ({
    id,
    lengthMilliseconds,
    audioURL,
    text: plainText,
    name,
    actions,
    annotations,
    transcript,
}: ICategorizableDetailQueryResult<IAudioItemViewModel>): JSX.Element => {
    const audioRef = useRef<HTMLAudioElement>(null);

    const [marks, setMarks] = useState([]);

    useEffect(() => {
        const updatedMarks = isNullOrUndefined(audioRef?.current?.currentTime)
            ? []
            : annotations.flatMap(({ connectedResources, name }) =>
                  convertAnnotationToMarks(
                      name.items[0].text,
                      connectedResources[0].context as ITimeRangeContext,
                      (timeStamp) => {
                          audioRef.current.currentTime = timeStamp;
                      }
                  )
              );

        setMarks(updatedMarks);
    }, [audioRef, annotations]);

    return (
        <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.audioItem}>
            {actions.some(({ type: commandType }) => commandType === CREATE_NOTE_ABOUT_RESOURCE) ? (
                <InteractiveAnnotator id={id} audioURL={audioURL} audioRef={audioRef} />
            ) : (
                <AudioPlayer audioUrl={audioURL} />
            )}
            <Box sx={{ width: '1000px' }}>
                Here is the slider.
                <Slider
                    aria-label="annotations"
                    defaultValue={0}
                    step={100}
                    min={0}
                    max={lengthMilliseconds}
                    valueLabelDisplay="auto"
                    marks={marks}
                />
            </Box>

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
                            <TranscriptPresenter transcript={transcript} />
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        </ResourceDetailFullViewPresenter>
    );
};
