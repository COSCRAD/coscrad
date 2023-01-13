import { ICategorizableDetailQueryResult, IPhotographViewModel } from '@coscrad/api-interfaces';
import { SinglePropertyPresenter } from 'apps/coscrad-frontend/src/utils/generic-components';
import styles from './photograph-detail.full-view.presenter.module.scss';

export const PhotographDetailFullViewPresenter = ({
    id,
    imageURL,
}: ICategorizableDetailQueryResult<IPhotographViewModel>): JSX.Element => (
    <div className={styles['photograph-detail-container']} data-testid={id}>
        <div className={styles['detail-image-container']}>
            <img src={imageURL} alt={id} />
        </div>
        <SinglePropertyPresenter display="Photograph ID" value={id} />
        <SinglePropertyPresenter display="Filename" value={imageURL} />
    </div>
);
