import {
    ICategorizableDetailQueryResult,
    IDigitalTextViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { ResourceDetailThumbnailPresenter } from '../../../utils/generic-components';

export const DigitalTextDetailThumbnailPresenter = ({
    id,
    name,
}: ICategorizableDetailQueryResult<IDigitalTextViewModel>): JSX.Element => {
    return (
        <ResourceDetailThumbnailPresenter id={id} name={name} type={ResourceType.digitalText}>
            hello
        </ResourceDetailThumbnailPresenter>
    );
};
