import {
    IAudioItemViewModel,
    ICategorizableDetailQueryResult,
    ResourceType,
} from '@coscrad/api-interfaces';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceDetailThumbnailPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { convertMillisecondsToSeconds } from '../utils/math';

export const AudioItemDetailThumbnailPresenter = ({
    id,
    name,
    lengthMilliseconds,
    audioURL,
}: ICategorizableDetailQueryResult<IAudioItemViewModel>): JSX.Element => {
    return (
        <ResourceDetailThumbnailPresenter id={id} name={name} type={ResourceType.audioItem}>
            <div data-testid={id} />
            {/* TODO: add spotify experience to audioItems thumbnail views */}
            <SinglePropertyPresenter
                display="Duration"
                value={convertMillisecondsToSeconds(lengthMilliseconds)}
            />
        </ResourceDetailThumbnailPresenter>
    );
};
