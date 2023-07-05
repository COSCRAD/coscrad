import {
    ICategorizableDetailQueryResult,
    IPhotographViewModel,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ImageFullPageWidth } from '../../../utils/generic-components/presenters/image-full-page-width';
import { ResourceNamePresenter } from '../../../utils/generic-components/presenters/resource-name-presenter';
import { ContextProps } from '../factories/full-view-categorizable-presenter-factory';

export const PhotographDetailFullViewPresenter = ({
    id,
    imageUrl,
    name,
}: ICategorizableDetailQueryResult<IPhotographViewModel> & ContextProps): JSX.Element => {
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
            <SinglePropertyPresenter display="Photograph ID" value={id} />
        </>
    );
};
