import {
    ICategorizableDetailQueryResult,
    IVideoViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { VideoPlayer } from '@coscrad/media-player';
import { Typography } from '@mui/material';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceDetailThumbnailPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { convertMillisecondsToSeconds } from '../utils/math';

export const VideoDetailThumbnailPresenter = ({
    id,
    lengthMilliseconds,
    transcript: text,
    name,
    videoUrl,
}: ICategorizableDetailQueryResult<IVideoViewModel>): JSX.Element => {
}: ICategorizableDetailQueryResult<IVideoViewModel> & ContextProps): JSX.Element => {
    return (
        <ResourceDetailThumbnailPresenter id={id} name={name} type={ResourceType.video}>
            <SinglePropertyPresenter
                display="Duration"
                value={convertMillisecondsToSeconds(lengthMilliseconds)}
            />
            <VideoPlayer videoUrl={videoUrl} />
            <Typography variant="h3">Transcript:</Typography>
            <Typography>{JSON.stringify(text)}</Typography>
        </ResourceDetailThumbnailPresenter>
    );
};
