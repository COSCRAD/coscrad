import { ICategorizableDetailQueryResult, IPhotographViewModel } from '@coscrad/api-interfaces';
import './photograph-detail.full-view.presenter.css';

export const PhotographDetailFullViewPresenter = ({
    id,
    imageURL,
}: ICategorizableDetailQueryResult<IPhotographViewModel>): JSX.Element => (
    <div className="photograph-detail-container" data-testid={id}>
        <h3>Photograph {id}</h3>
        <div className="detail-image-container">
            <img src={imageURL} alt={id} />
        </div>
    </div>
);
