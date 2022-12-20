import {
    ICategorizableDetailQueryResult,
    IPhotographViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Link } from 'react-router-dom';
import { routes } from '../../../app/routes/routes';
import './photograph-detail.thumbnail.presenter.css';

export const PhotographDetailThumbnailPresenter = ({
    id,
    imageURL,
    photographer,
}: ICategorizableDetailQueryResult<IPhotographViewModel>): JSX.Element => (
    <Link to={`/${routes.resources.ofType(ResourceType.photograph).detail(id)}`}>
        <div className="detail-thumbnail-container" title="View Connected Photograph">
            <div className="detail-thumbnail-image-container">
                <img src={imageURL} alt={`For ${ResourceType.photograph}/${id}`} />
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
