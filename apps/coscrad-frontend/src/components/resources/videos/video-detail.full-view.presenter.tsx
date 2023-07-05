import {
    ICategorizableDetailQueryResult,
    IVideoViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { ContextProps } from '../factories/full-view-categorizable-presenter-factory';
import { convertMillisecondsToSeconds } from '../utils/math';

export const VideoDetailFullViewPresenter = ({
    lengthMilliseconds,
    text: plainText,
    name,
    id,
}: ICategorizableDetailQueryResult<IVideoViewModel> & ContextProps): JSX.Element => (
    <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.video}>
        <div data-testid={id} />
        <SinglePropertyPresenter
            display="Duration"
            value={convertMillisecondsToSeconds(lengthMilliseconds)}
        />
        {/* TODO[https://www.pivotaltracker.com/story/show/184530937] Support video playback via the media player lib  */}
        {/* TODO[https://www.pivotaltracker.com/story/show/184666073] Create a transcript presenter */}
        <h3>Transcript:</h3>
        <p>{plainText}</p>
    </ResourceDetailFullViewPresenter>
);
