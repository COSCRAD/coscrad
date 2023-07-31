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

export const TermDetailThumbnailPresenter = ({
    id,
    name,
    contributor,
    audioURL,
}: ICategorizableDetailQueryResult<ITermViewModel>): JSX.Element => {
    return (
        <ResourceDetailThumbnailPresenter id={id} name={name} type={ResourceType.term}>
            <SingleOptionalPropertyPresenter display="Contributor" value={contributor} />
            <div id="media-player">
                <AudioPlayer audioUrl={audioURL} />
            </div>
        </ResourceDetailThumbnailPresenter>
    );
};
