import { IDetailQueryResult, IPhotographViewModel, ResourceType } from '@coscrad/api-interfaces';
import { routes } from 'apps/coscrad-frontend/src/app/routes/routes';
import { Link } from 'react-router-dom';

export const PhotographDetailThumbnailPresenter = ({
    data: photograph,
}: IDetailQueryResult<IPhotographViewModel>): JSX.Element => {
    return (
        <div>
            <div className="detail-thumbnail-image-container">
                <Link to={routes.resources.ofType(ResourceType.photograph).detail(photograph.id)}>
                    <img src={photograph.imageURL} />
                </Link>
            </div>
        </div>
    );
};
