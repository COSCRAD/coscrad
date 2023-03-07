import {
    ICategorizableDetailQueryResult,
    IVideoViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { convertMillisecondsToSeconds } from '../utils/math';

export const VideoDetailFullViewPresenter = ({
    lengthMilliseconds,
    text: plainText,
    name,
    id,
}: ICategorizableDetailQueryResult<IVideoViewModel>): JSX.Element => (
    <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.video}>
        <SinglePropertyPresenter
            display="Duration"
            value={convertMillisecondsToSeconds(lengthMilliseconds)}
        />
        {/* TODO[https://www.pivotaltracker.com/story/show/184530937] Support video playback via the media player lib  */}
        <h3>Transcript:</h3>
        <p>{plainText}</p>
    </ResourceDetailFullViewPresenter>
);
