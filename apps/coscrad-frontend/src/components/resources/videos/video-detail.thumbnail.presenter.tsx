import {
    ICategorizableDetailQueryResult,
    IVideoViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
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
            <h3>Transcript:</h3>
            <p>{plainText}</p>
        </ResourceDetailThumbnailPresenter>
    );
};
