import {
    ICategorizableDetailQueryResult,
    IPhotographViewModel,
    MultilingualTextItemRole,
    ResourceType,
} from '@coscrad/api-interfaces';
import { IdInfoIcon } from 'apps/coscrad-frontend/src/utils/generic-components/presenters/id-info-icon/id-info-icon';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ImageFullPageWidth } from '../../../utils/generic-components/presenters/image-full-page-width';
import { ResourceNamePresenter } from '../../../utils/generic-components/presenters/resource-name-presenter';

export const PhotographDetailFullViewPresenter = ({
    id,
    imageUrl,
    name,
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
            <div data-testid={id} />
            <ImageFullPageWidth image={image} />
            <ResourceNamePresenter name={name} variant="h2" />
            <IdInfoIcon id={id} type={ResourceType.photograph} />
            <SinglePropertyPresenter display="Photograph ID" value={id} />
        </>
    );
};
