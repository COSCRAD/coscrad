import {
    ICategorizableDetailQueryResult,
    ITermViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { AudioPlayer } from '@coscrad/media-player';
import {
    ResourceDetailThumbnailPresenter,
    SingleOptionalPropertyPresenter,
} from '../../../utils/generic-components/';
import { ContextProps } from '../factories/full-view-categorizable-presenter-factory';

export const TermDetailThumbnailPresenter = ({
    id,
    name,
    contributor,
    audioURL,
}: ICategorizableDetailQueryResult<ITermViewModel> & ContextProps): JSX.Element => {
    return (
        <ResourceDetailThumbnailPresenter id={id} name={name} type={ResourceType.term}>
            <SingleOptionalPropertyPresenter display="Contributor" value={contributor} />
            <div id="media-player">
                <AudioPlayer audioUrl={audioURL} />
            </div>
        </ResourceDetailThumbnailPresenter>
    );
};
