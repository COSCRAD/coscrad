import {
    ICategorizableDetailQueryResult,
    IPhotographViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Card, CardContent } from '@mui/material';
import { routes } from '../../../app/routes/routes';
import { FloatSpacerDiv, SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceNavLink } from '../shared/resource-nav-link';
import styles from './photograph-detail.thumbnail.presenter.module.scss';

export const PhotographDetailThumbnailPresenter = ({
    id,
    imageURL,
    photographer,
}: ICategorizableDetailQueryResult<IPhotographViewModel>): JSX.Element => (
    <Card>
        <CardContent>
            <div className={styles['preview']}>
                <img src={imageURL} alt={`For ${ResourceType.photograph}/${id}`} />
            </div>
            <div className={styles['meta']}>
                <SinglePropertyPresenter display="Photograph ID" value={id} />
                <SinglePropertyPresenter display="Photographer" value={photographer} />
            </div>
            <div className={styles['resource-nav-link']}>
                <ResourceNavLink
                    linkURL={`/${routes.resources.ofType(ResourceType.photograph).detail(id)}`}
                />
            </div>
            <FloatSpacerDiv />
        </CardContent>
    </Card>
);
