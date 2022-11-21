import { IDetailQueryResult, IPhotographViewModel, ResourceType } from '@coscrad/api-interfaces';
import { routes } from 'apps/coscrad-frontend/src/app/routes/routes';
import { Link } from 'react-router-dom';
import './photograph-detail.thumbnail.presenter.css';

export const PhotographDetailThumbnailPresenter = ({
    data: { id, imageURL, photographer },
}: IDetailQueryResult<IPhotographViewModel>): JSX.Element => (
    <Link to={`/${routes.resources.ofType(ResourceType.photograph).detail(id)}`}>
        <div className="detail-thumbnail-container" title="View Connected Photograph">
            <div className="detail-thumbnail-image-container">
                <img src={imageURL} />
            </div>
            <div className="detail-thumbnail-meta-container">
                <strong>Photograph ID:</strong> {id}
                <br />
                <strong>Photographer:</strong> {photographer}
            </div>
            <div className="spacer">&nbsp;</div>
        </div>
    </Link>
);
