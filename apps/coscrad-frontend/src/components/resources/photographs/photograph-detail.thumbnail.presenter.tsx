import {
    ICategorizableDetailQueryResult,
    IPhotographViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceDetailThumbnailPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { ContextProps } from '../factories/full-view-categorizable-presenter-factory';

export const PhotographDetailThumbnailPresenter = ({
    id,
    photographer,
}: ICategorizableDetailQueryResult<IPhotographViewModel> & ContextProps): JSX.Element => {
    /**
     * Temporary placeholder: I'm putting a name here instead of editing the
     * view model for photograph.  I assume we'll assign a name property in
     * the domain first
     */
    const name = 'Photograph 1';

    return (
        <ResourceDetailThumbnailPresenter id={id} name={name} type={ResourceType.photograph}>
            <SinglePropertyPresenter display="Photographer" value={photographer} />
        </ResourceDetailThumbnailPresenter>
    );
};
