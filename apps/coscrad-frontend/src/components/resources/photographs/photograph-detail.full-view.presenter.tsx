import {
    AggregateType,
    ICategorizableDetailQueryResult,
    IPhotographViewModel,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { ResourceNamePresenter } from 'apps/coscrad-frontend/src/utils/generic-components/presenters/resource-name-presenter';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { buildDataAttributeForAggregateDetailComponent } from '../../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';
import { ImageFullPageWidth } from '../../../utils/generic-components/presenters/image-full-page-width';

export const PhotographDetailFullViewPresenter = ({
    id,
    imageUrl,
    name,
    photographer,
}: ICategorizableDetailQueryResult<IPhotographViewModel>): JSX.Element => {
    // Simulating image object retrieved from Digital Asset Manager
    const image = {
        src: imageUrl,
        width: 2000,
        height: 1329,
        title:
            name?.items.find(({ role }) => role === MultilingualTextItemRole.original)?.text ||
            `photograph/${id}`,
    };

    return (
        <>
            <div
                data-testid={buildDataAttributeForAggregateDetailComponent(
                    AggregateType.photograph,
                    id
                )}
            />
            <ImageFullPageWidth image={image} />
            <ResourceNamePresenter name={name} variant="h2" />
            <SinglePropertyPresenter display="Photographer" value={photographer} />
        </>
    );
};
