import {
    ICategorizableDetailQueryResult,
    ITermViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { AudioClipPlayer } from '@coscrad/media-player';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { AudioFile as AudioFileIcon } from '@mui/icons-material/';
import { Box, Grid, Tooltip, Typography } from '@mui/material';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/';

export const TermDetailFullViewPresenter = ({
    id,
    name,
    contributions,
    audioURL,
}: ICategorizableDetailQueryResult<ITermViewModel>): JSX.Element => {
    return (
        <ResourceDetailFullViewPresenter
            name={name}
            id={id}
            type={ResourceType.term}
            contributions={contributions}
        >
            {!isNullOrUndefined(audioURL) ? (
                <Box id="media-player">
                    <AudioClipPlayer audioUrl={audioURL} />
                </Box>
            ) : (
                <Grid
                    container
                    justifyContent="flex-start"
                    spacing="10"
                    direction="row"
                    mt={2}
                    mb={2}
                >
                    <Grid item>
                        <Tooltip title="Audio unavailable">
                            <AudioFileIcon />
                        </Tooltip>
                    </Grid>
                    <Grid item zeroMinWidth xs>
                        <Typography variant="body1">Audio not available for this term.</Typography>
                    </Grid>
                </Grid>
            )}
        </ResourceDetailFullViewPresenter>
    );
};
