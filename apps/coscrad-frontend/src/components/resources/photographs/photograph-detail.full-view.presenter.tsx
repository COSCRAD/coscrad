import { ICategorizableDetailQueryResult, IPhotographViewModel } from '@coscrad/api-interfaces';
import styles from './photograph-detail.full-view.presenter.module.scss';

export const PhotographDetailFullViewPresenter = ({
    id,
    imageURL,
}: ICategorizableDetailQueryResult<IPhotographViewModel>): JSX.Element => (
    <div className={styles['photograph-detail-container']} data-testid={id}>
        <h3>Photograph {id}</h3>
        <div className={styles['detail-image-container']}>
            <img src={imageURL} alt={id} />
        </div>
    </div>
);
