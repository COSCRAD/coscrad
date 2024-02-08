import {
    IAudioItemViewModel,
    ICategorizableDetailQueryResult,
    ITimeRangeContext,
    MultilingualTextItemRole,
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
    Typography,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { SinglePropertyPresenter } from '../../../utils/generic-components/presenters/single-property-presenter';
import { Timeline, TimelineMark, buildTimelineMark } from '../../timeline';
import { convertMillisecondsToSeconds } from '../utils/math';
import { InteractiveAnnotator } from './interactive-annotator';

const CREATE_NOTE_ABOUT_RESOURCE = 'CREATE_NOTE_ABOUT_RESOURCE';

export const AudioItemDetailFullViewPresenter = ({
    id,
    lengthMilliseconds,
    audioURL,
    text: plainText,
    name,
    actions,
    annotations,
}: ICategorizableDetailQueryResult<IAudioItemViewModel>): JSX.Element => {
    const audioRef = useRef(null);

    const [marks, setMarks] = useState<TimelineMark[]>([]);

    useEffect(() => {
        const updatedMarks = isNullOrUndefined(audioRef?.current?.currentTime)
            ? []
            : annotations.flatMap(({ connectedResources, note, name, id: noteId }) => {
                  const timeRangeContext = connectedResources[0].context as ITimeRangeContext;

                  const {
                      timeRange: { inPointMilliseconds, outPointMilliseconds },
                  } = timeRangeContext;

                  const text = name.items.find(
                      ({ role }) => role === MultilingualTextItemRole.original
                  )?.text;

                  const fullText = `[${inPointMilliseconds}] ${note} [${outPointMilliseconds}]`;

                  /**
                   * Should we break this logic out so we can share it for
                   * video annotation?
                   */
                  return [
                      buildTimelineMark({
                          // Shouldn't this be an icon instead?
                          text: `<-`,
                          tip: fullText,
                          value: inPointMilliseconds,
                          name: `${noteId}:in`,
                          onClick: () => {
                              console.log({ currentInTime: inPointMilliseconds });

                              audioRef.current.currentTime =
                                  convertMillisecondsToSeconds(inPointMilliseconds);
                          },
                      }),
                      buildTimelineMark({
                          text: `->`,
                          tip: fullText,
                          value: outPointMilliseconds,
                          name: `${noteId}:out`,
                          onClick: () => {
                              console.log({ currentTime: outPointMilliseconds });

                              audioRef.current.currentTime =
                                  convertMillisecondsToSeconds(outPointMilliseconds);
                          },
                      }),
                  ];
              });

        setMarks(updatedMarks);
    }, [audioRef, annotations]);

    const formatedPlainText = plainText.split('\n').map((line, index) => (
        <Box mb={1} key={index}>
            {line}
        </Box>
    ));

    return (
        <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.audioItem}>
            {actions.some(({ type: commandType }) => commandType === CREATE_NOTE_ABOUT_RESOURCE) ? (
                <InteractiveAnnotator id={id} audioURL={audioURL} audioRef={audioRef} />
            ) : (
                <AudioPlayer audioUrl={audioURL} />
            )}
            <Typography variant="h3">Annotation Track</Typography>
            {marks.length > 0 ? (
                <Timeline
                    name={`Annotation Track`}
                    step={100}
                    defaultValue={0}
                    min={0}
                    max={lengthMilliseconds}
                    marks={marks}
                />
            ) : null}
            {/* <Typography variant='h3'>Transcript Track</Typography> */}

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
