import {
    ICategorizableDetailQueryResult,
    IPhotographViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Card, CardContent, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { routes } from '../../../app/routes/routes';
import { FloatSpacerDiv, SinglePropertyPresenter } from '../../../utils/generic-components';
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
                <Link to={`/${routes.resources.ofType(ResourceType.photograph).detail(id)}`}>
                    <IconButton aria-label="navigate to resource" sx={{ ml: 0.5 }}>
                        <ArrowForwardIosIcon />
                    </IconButton>
                </Link>
            </div>
            <FloatSpacerDiv />
        </CardContent>
    </Card>
);
