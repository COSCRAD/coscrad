import {
    ICategorizableDetailQueryResult,
    IVideoViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { VideoPrototypePlayer } from '@coscrad/media-player';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { convertMillisecondsToSeconds } from '../utils/math';

export const VideoDetailFullViewPresenter = ({
    lengthMilliseconds,
    transcript,
    name,
    id,
    videoUrl,
}: ICategorizableDetailQueryResult<IVideoViewModel>): JSX.Element => {
    return (
        <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.video}>
            <SinglePropertyPresenter
                display="Duration"
                value={convertMillisecondsToSeconds(lengthMilliseconds)}
            />
            <VideoPrototypePlayer videoUrl={videoUrl} transcript={transcript} />
        </ResourceDetailFullViewPresenter>
    );
};
