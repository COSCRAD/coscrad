import { ICategorizableDetailQueryResult, IPhotographViewModel } from '@coscrad/api-interfaces';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ImageFullPageWidth } from '../../../utils/generic-components/presenters/image-full-page-width';
import { CoscradMainContentContainer } from '../../../utils/generic-components/style-components/coscrad-main-content-container';

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
            <ImageFullPageWidth image={image} />
            <CoscradMainContentContainer>
                <SinglePropertyPresenter display="Name" value={name} />
                <SinglePropertyPresenter display="Photograph ID" value={id} />
                <div style={{ height: '1px' }} data-testid={id}>
                    &nbsp;
                </div>
            </CoscradMainContentContainer>
        </>
    );
};
