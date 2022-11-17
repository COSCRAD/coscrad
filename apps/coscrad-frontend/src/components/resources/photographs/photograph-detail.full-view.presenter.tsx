import { IDetailQueryResult, IPhotographViewModel } from '@coscrad/api-interfaces';
import './photograph-detail.full-view.presenter.css';

export const PhotographDetailFullViewPresenter = ({
    data: photograph,
}: IDetailQueryResult<IPhotographViewModel>): JSX.Element => {
    return (
        <div className="photograph-detail-container" data-testid={photograph.id}>
            <h3>Photograph {photograph.id}</h3>
            <div className="detail-image-container">
                <img src={photograph.imageURL} />
            </div>
        </div>
    );
};
