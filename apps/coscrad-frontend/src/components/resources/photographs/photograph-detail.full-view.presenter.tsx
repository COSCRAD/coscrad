import { ICategorizableDetailQueryResult, IPhotographViewModel } from '@coscrad/api-interfaces';
import { CoscradMainContentContainer } from 'apps/coscrad-frontend/src/utils/generic-components/style-components/coscrad-main-content-container';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { FullImageView } from '../../../utils/generic-components/presenters/full-image-view';

export const PhotographDetailFullViewPresenter = ({
    id,
    imageURL,
}: ICategorizableDetailQueryResult<IPhotographViewModel>): JSX.Element => {
    const name = 'Totem Pole';

    return (
        <>
            <FullImageView imageUrl={imageURL} alt={name} />
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
