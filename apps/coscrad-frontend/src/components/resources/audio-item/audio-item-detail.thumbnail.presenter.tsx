import {
    IAudioItemViewModel,
    ICategorizableDetailQueryResult,
    ResourceType,
} from '@coscrad/api-interfaces';
import { ResourceDetailThumbnailPresenter } from '../../../utils/generic-components/presenters/detail-views';

export const AudioItemDetailThumbnailPresenter = ({
    id,
    name,
}: ICategorizableDetailQueryResult<IAudioItemViewModel>): JSX.Element => {
    return (
        <ResourceDetailThumbnailPresenter id={id} name={name} type={ResourceType.audioItem}>
            {/* TODO: add spotify experience to audioItems thumbnail views */}
            {/* TODO pull the length from the media management service */}
            {/* <SinglePropertyPresenter
                display="Duration"
                value={convertMillisecondsToSeconds(lengthMilliseconds)}
            /> */}
        </ResourceDetailThumbnailPresenter>
    );
};
