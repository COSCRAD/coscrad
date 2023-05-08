import { ICategorizableDetailQueryResult, IPhotographViewModel } from '@coscrad/api-interfaces';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ImageFullPageWidth } from '../../../utils/generic-components/presenters/image-full-page-width';
import { ResourceNamePresenter } from '../../../utils/generic-components/presenters/resource-name-presenter';

export const PhotographDetailFullViewPresenter = ({
    id,
    imageURL,
}: ICategorizableDetailQueryResult<IPhotographViewModel>): JSX.Element => {
    const name = 'Totem Pole';

    // Simulating image object retrieved from Digital Asset Manager
    const image = {
        src: imageURL,
        width: 2000,
        height: 1329,
        title: 'Haida play Singii Ganguu',
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
