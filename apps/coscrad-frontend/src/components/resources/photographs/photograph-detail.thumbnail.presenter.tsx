import {
    ICategorizableDetailQueryResult,
    IPhotographViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceDetailThumbnailPresenter } from '../../../utils/generic-components/presenters/detail-views';

export const PhotographDetailThumbnailPresenter = ({
    id,
    name,
    photographer,
}: ICategorizableDetailQueryResult<IPhotographViewModel>): JSX.Element => {
    return (
        <ResourceDetailThumbnailPresenter id={id} name={name} type={ResourceType.photograph}>
            <SinglePropertyPresenter display="Photographer" value={photographer} />
        </ResourceDetailThumbnailPresenter>
    );
};
