import {
    IAudioItemViewModel,
    ICategorizableDetailQueryResult,
    ResourceType,
} from '@coscrad/api-interfaces';
import { MediaPlayer } from '@coscrad/media-player';
import { Box, Grid, Typography } from '@mui/material';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { SinglePropertyPresenter } from '../../../utils/generic-components/presenters/single-property-presenter';
import { convertMillisecondsToSeconds } from '../utils/math';

export const AudioItemDetailFullViewPresenter = ({
    id,
    lengthMilliseconds,
    audioURL,
    text: plainText,
    name,
}: ICategorizableDetailQueryResult<IAudioItemViewModel>): JSX.Element => {
    const formatedPlainText = plainText.split('\n').map((line, index) => (
        <Box mb={1} key={index}>
            {line}
        </Box>
    ));

    return (
        <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.audioItem}>
            <div data-testid={id} />
            <MediaPlayer audioUrl={audioURL} />
            <SinglePropertyPresenter
                display="Duration"
                value={`${convertMillisecondsToSeconds(lengthMilliseconds)} secs`}
            />
            <SinglePropertyPresenter display="Audio Url" value={audioURL} />
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
        </ResourceDetailFullViewPresenter>
    );
};
