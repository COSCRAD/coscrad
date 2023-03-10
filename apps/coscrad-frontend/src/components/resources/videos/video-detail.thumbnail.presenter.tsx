import {
    ICategorizableDetailQueryResult,
    IVideoViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceDetailThumbnailPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { convertMillisecondsToSeconds } from '../utils/math';

export const VideoDetailThumbnailPresenter = ({
    id,
    lengthMilliseconds,
    text: plainText,
    name,
}: ICategorizableDetailQueryResult<IVideoViewModel>): JSX.Element => {
    return (
        <ResourceDetailThumbnailPresenter id={id} name={name} type={ResourceType.video}>
            <SinglePropertyPresenter
                display="Duration"
                value={convertMillisecondsToSeconds(lengthMilliseconds)}
            />
            <Typography variant="h3">Transcript:</Typography>
            <Typography>{plainText}</Typography>
        </ResourceDetailThumbnailPresenter>
    );
};
