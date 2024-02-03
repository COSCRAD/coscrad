import {
    IAudioItemViewModel,
    ICategorizableDetailQueryResult,
    ResourceType,
} from '@coscrad/api-interfaces';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceDetailThumbnailPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { convertMillisecondsToSecondsRounded } from '../utils/math';

export const AudioItemDetailThumbnailPresenter = ({
    id,
    name,
    lengthMilliseconds,
}: ICategorizableDetailQueryResult<IAudioItemViewModel>): JSX.Element => {
    return (
        <ResourceDetailThumbnailPresenter id={id} name={name} type={ResourceType.audioItem}>
            {/* TODO: add spotify experience to audioItems thumbnail views */}
            <SinglePropertyPresenter
                display="Duration"
                value={convertMillisecondsToSecondsRounded(lengthMilliseconds)}
            />
        </ResourceDetailThumbnailPresenter>
    );
};
