import {
    IAudioItemViewModel,
    ICategorizableDetailQueryResult,
    ResourceType,
} from '@coscrad/api-interfaces';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceDetailThumbnailPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { ContextProps } from '../factories/full-view-categorizable-presenter-factory';
import { convertMillisecondsToSeconds } from '../utils/math';

export const AudioItemDetailThumbnailPresenter = ({
    id,
    name,
    lengthMilliseconds,
}: ICategorizableDetailQueryResult<IAudioItemViewModel> & ContextProps): JSX.Element => {
    return (
        <ResourceDetailThumbnailPresenter id={id} name={name} type={ResourceType.audioItem}>
            {/* TODO: add spotify experience to audioItems thumbnail views */}
            <SinglePropertyPresenter
                display="Duration"
                value={convertMillisecondsToSeconds(lengthMilliseconds)}
            />
        </ResourceDetailThumbnailPresenter>
    );
};
