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
    /**
     * Temporary placeholder: I'm assuming every resource will have at minimum the
     * icon of its resource type.
     */
    const imgURL = 'https://digitalassetmanager.com/videoframe.jpg';

    return (
        <ResourceDetailThumbnailPresenter
            id={id}
            name={name}
            type={ResourceType.video}
            src={imgURL}
        >
            <SinglePropertyPresenter
                display="Duration"
                value={convertMillisecondsToSeconds(lengthMilliseconds)}
            />
            <h3>Transcript:</h3>
            <p>{plainText}</p>
        </ResourceDetailThumbnailPresenter>
    );
};
