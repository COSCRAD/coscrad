import { IDetailQueryResult, IPhotographViewModel, ResourceType } from '@coscrad/api-interfaces';
import { routes } from 'apps/coscrad-frontend/src/app/routes/routes';
import { Link } from 'react-router-dom';
import './photograph-detail.thumbnail.presenter.css';

export const PhotographDetailThumbnailPresenter = ({
    data: photograph,
}: IDetailQueryResult<IPhotographViewModel>): JSX.Element => {
    const location = `/${routes.resources.ofType(ResourceType.photograph).detail(photograph.id)}`;

    return (
        <Link to={location}>
            <div className="detail-thumbnail-container" title="View Connected Photograph">
                <div className="detail-thumbnail-image-container">
                    <img src={photograph.imageURL} />
                </div>
                <div className="detail-thumbnail-meta-container">
                    <strong>Photograph ID:</strong> {photograph.id}
                    <br />
                    <strong>Photographer:</strong> {photograph.photographer}
                </div>
                <div className="spacer">&nbsp;</div>
            </div>
        </Link>
    );
};
