import {
    ICategorizableDetailQueryResult,
    ITermViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { MediaPlayer } from '@coscrad/media-player';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import {
    ResourceDetailThumbnailPresenter,
    SingleOptionalPropertyPresenter,
} from '../../../utils/generic-components/';

export const TermDetailThumbnailPresenter = ({
    id,
    name,
    contributor,
    audioURL,
}: ICategorizableDetailQueryResult<ITermViewModel>): JSX.Element => {
    return (
        <ResourceDetailThumbnailPresenter id={id} name={name} type={ResourceType.term}>
            <div data-testid={id} />
            <SingleOptionalPropertyPresenter display="Contributor" value={contributor} />
            {!isNullOrUndefined(audioURL) ? (
                <div id="media-player">
                    <MediaPlayer listenMessage="Play!" audioUrl={audioURL} />
                </div>
            ) : null}
        </ResourceDetailThumbnailPresenter>
    );
};
