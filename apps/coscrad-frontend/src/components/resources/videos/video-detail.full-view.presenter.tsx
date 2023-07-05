import {
    ICategorizableDetailQueryResult,
    IVideoViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { VideoPlayer } from '@coscrad/media-player';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { TranscriptPresenter } from '../../transcripts/transcript-presenter';
import { convertMillisecondsToSeconds } from '../utils/math';

export const VideoDetailFullViewPresenter = ({
    lengthMilliseconds,
    transcript,
    name,
    id,
    videoUrl,
}: ICategorizableDetailQueryResult<IVideoViewModel>): JSX.Element => (
}: ICategorizableDetailQueryResult<IVideoViewModel> & ContextProps): JSX.Element => (
    <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.video}>
        <SinglePropertyPresenter
            display="Duration"
            value={convertMillisecondsToSeconds(lengthMilliseconds)}
        />
        <VideoPlayer videoUrl={videoUrl} />
        <TranscriptPresenter transcript={transcript} />
    </ResourceDetailFullViewPresenter>
);
