import {
    ICategorizableDetailQueryResult,
    ITermViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { MediaPlayer } from '@coscrad/media-player';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import {
    ResourceDetailFullViewPresenter,
    SingleOptionalPropertyPresenter,
} from '../../../utils/generic-components/';

// TODO[https://www.pivotaltracker.com/story/show/183681722] expose commands
export const TermDetailFullViewPresenter = ({
    id,
    name,
    contributor,
    audioURL,
}: ICategorizableDetailQueryResult<ITermViewModel>): JSX.Element => {
    return (
        <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.term}>
            <div data-testid={id} />
            <SingleOptionalPropertyPresenter display="Contributor" value={contributor} />
            {!isNullOrUndefined(audioURL) ? (
                <div id="media-player">
                    <MediaPlayer listenMessage="Play!" audioUrl={audioURL} />
                </div>
            ) : null}
        </ResourceDetailFullViewPresenter>
    );
};
