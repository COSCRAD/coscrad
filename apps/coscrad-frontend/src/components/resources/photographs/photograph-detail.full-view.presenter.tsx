import { IDetailQueryResult, IPhotographViewModel } from '@coscrad/api-interfaces';
import './photograph-detail.full-view.presenter.css';

export const PhotographDetailFullViewPresenter = ({
    data: { id, imageURL },
}: IDetailQueryResult<IPhotographViewModel>): JSX.Element => {
    return (
        <div className="photograph-detail-container" data-testid={id}>
            <h3>Photograph {id}</h3>
            <div className="detail-image-container">
                <img src={imageURL} />
            </div>
        </div>
    );
};
