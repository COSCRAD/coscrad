import {
    ICategorizableDetailQueryResult,
    IDigitalTextViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { ResourceDetailThumbnailPresenter } from '../../../utils/generic-components';

export const DigitalTextDetailThumbnailPresenter = ({
    id,
    title,
}: ICategorizableDetailQueryResult<IDigitalTextViewModel>): JSX.Element => {
    return (
        <ResourceDetailThumbnailPresenter id={id} name={title} type={ResourceType.digitalText}>
            hello
        </ResourceDetailThumbnailPresenter>
    );
};
