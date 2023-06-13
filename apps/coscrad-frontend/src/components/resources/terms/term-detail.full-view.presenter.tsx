import {
    ICategorizableDetailQueryResult,
    ITermViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { AudioClipPlayer, DefaultPlayButton } from '@coscrad/media-player';
import { Box } from '@mui/material';
import {
    ResourceDetailFullViewPresenter,
    SingleOptionalPropertyPresenter,
} from '../../../utils/generic-components/';

// TODO[https://www.pivotaltracker.com/story/show/183681722] expose commands
export const TermDetailFullViewPresenter = ({
    id,
    name,
    contributor,
    audioURL,
}: ICategorizableDetailQueryResult<ITermViewModel>): JSX.Element => {
    return (
        <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.term}>
            <Box data-testid={id} />
            <SingleOptionalPropertyPresenter display="Contributor" value={contributor} />
            <Box id="media-player">
                <AudioClipPlayer audioUrl={audioURL} PlayButton={DefaultPlayButton} />
            </Box>
        </ResourceDetailFullViewPresenter>
    );
};
