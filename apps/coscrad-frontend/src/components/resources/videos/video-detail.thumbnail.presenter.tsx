import { ICategorizableDetailQueryResult, IVideoViewModel } from '@coscrad/api-interfaces';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceDetailThumbnailPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { convertMillisecondsToSeconds } from '../utils/math';

export const VideoDetailThumbnailPresenter = ({
    lengthMilliseconds,
    text: plainText,
    name,
}: ICategorizableDetailQueryResult<IVideoViewModel>): JSX.Element => (
    <ResourceDetailThumbnailPresenter name={name}>
        <SinglePropertyPresenter
            display="Duration"
            value={convertMillisecondsToSeconds(lengthMilliseconds)}
        />
        <h3>Transcript:</h3>
        <p>{plainText}</p>
    </ResourceDetailThumbnailPresenter>
);
