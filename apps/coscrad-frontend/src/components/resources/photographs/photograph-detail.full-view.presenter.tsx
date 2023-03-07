import {
    ICategorizableDetailQueryResult,
    IPhotographViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { FullImageView } from '../../../utils/generic-components/presenters/full-image-view';

export const PhotographDetailFullViewPresenter = ({
    id,
    imageURL,
}: ICategorizableDetailQueryResult<IPhotographViewModel>): JSX.Element => {
    const name = 'Photograph 1';

    return (
        <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.photograph}>
            <FullImageView imageUrl={imageURL} alt={name} />
            <SinglePropertyPresenter display="Photograph ID" value={id} />
        </ResourceDetailFullViewPresenter>
    );
};
