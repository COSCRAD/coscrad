import {
    ICategorizableDetailQueryResult,
    IVideoViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { VideoPlayer } from '@coscrad/media-player';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { convertMillisecondsToSeconds } from '../utils/math';

export const VideoDetailFullViewPresenter = ({
    lengthMilliseconds,
    transcript,
    name,
    id,
    videoUrl,
}: ICategorizableDetailQueryResult<IVideoViewModel>): JSX.Element => (
    <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.video}>
        <SinglePropertyPresenter
            display="Duration"
            value={convertMillisecondsToSeconds(lengthMilliseconds)}
        />
        <VideoPlayer videoUrl={videoUrl} />
        {/* TODO[https://www.pivotaltracker.com/story/show/184666073] Create a transcript presenter */}
        <h3>Transcript:</h3>
        <p>{JSON.stringify(transcript)}</p>
    </ResourceDetailFullViewPresenter>
);
