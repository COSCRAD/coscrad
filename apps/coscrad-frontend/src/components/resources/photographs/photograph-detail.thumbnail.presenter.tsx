import {
    ICategorizableDetailQueryResult,
    IPhotographViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { ResourceDetailThumbnailPresenter } from '../../../utils/generic-components/presenters/detail-views';

export const PhotographDetailThumbnailPresenter = ({
    id,
}: ICategorizableDetailQueryResult<IPhotographViewModel>): JSX.Element => {
    /**
     * Temporary placeholder: I'm putting a name here instead of editing the
     * view model for photograph.  I assume we'll assign a name property in
     * the domain first
     */
    const name = 'Photograph 1';

    return (
        <ResourceDetailThumbnailPresenter id={id} name={name} type={ResourceType.photograph}>
            {/* Add contributor to replace photographer */}
        </ResourceDetailThumbnailPresenter>
    );
};
