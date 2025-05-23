import {
    ICategorizableDetailQueryResult,
    ITermViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { AudioClipPlayer } from '@coscrad/media-player';
import { Box } from '@mui/material';
import {
    ResourceDetailThumbnailPresenter,
    SingleOptionalPropertyPresenter,
} from '../../../utils/generic-components/';

export const TermDetailThumbnailPresenter = ({
    id,
    name,
    contributions,
    audioURL,
}: ICategorizableDetailQueryResult<ITermViewModel>): JSX.Element => {
    return (
        <ResourceDetailThumbnailPresenter id={id} name={name} type={ResourceType.term}>
            <SingleOptionalPropertyPresenter
                display="Contributors"
                value={contributions.join(', ')}
            />
            <Box id="media-player">
                <AudioClipPlayer audioUrl={audioURL} />
            </Box>
        </ResourceDetailThumbnailPresenter>
    );
};
