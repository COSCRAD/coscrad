import {
    IAudioItemViewModel,
    ICategorizableDetailQueryResult,
    ResourceType,
} from '@coscrad/api-interfaces';
import { AudioPlayer } from '@coscrad/media-player';
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
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { SinglePropertyPresenter } from '../../../utils/generic-components/presenters/single-property-presenter';
import { InteractiveAnnotator } from './interactive-annotator';

const CREATE_NOTE_ABOUT_RESOURCE = 'CREATE_NOTE_ABOUT_RESOURCE';

export const AudioItemDetailFullViewPresenter = ({
    id,
    audioURL,
    text: plainText,
    name,
    actions,
    contributions,
}: ICategorizableDetailQueryResult<IAudioItemViewModel>): JSX.Element => {
    const formatedPlainText = plainText.split('\n').map((line, index) => (
        <Box mb={1} key={index}>
            {line}
        </Box>
    ));

    return (
        <ResourceDetailFullViewPresenter
            name={name}
            id={id}
            type={ResourceType.audioItem}
            contributions={contributions}
        >
            {actions.some(({ type: commandType }) => commandType === CREATE_NOTE_ABOUT_RESOURCE) ? (
                <InteractiveAnnotator id={id} audioURL={audioURL} />
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
                    {/* TODO pull this from the media server */}
                    {/* <SinglePropertyPresenter
                        display="Duration"
                        value={`${convertMillisecondsToSeconds(lengthMilliseconds)} secs`}
                    /> */}
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
