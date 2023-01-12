import { IBookViewModel, ResourceType } from '@coscrad/api-interfaces';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { routes } from '../../../app/routes/routes';
import { FloatSpacerDiv, SinglePropertyPresenter } from '../../../utils/generic-components';
import styles from './BookInfo.module.scss';

export const BookInfo = ({
    id,
    title,
    subtitle,
    author,
    publicationDate,
    pages,
}: IBookViewModel) => {
    return (
        <>
            <div className={styles['meta']}>
                <div>
                    <strong>{title}</strong>
                </div>
                {subtitle && <SinglePropertyPresenter display="Subtitle" value={subtitle} />}
                <div>
                    <SinglePropertyPresenter display="Author" value={author} />
                </div>
                {publicationDate && (
                    <SinglePropertyPresenter display="Published" value={publicationDate} />
                )}
                <SinglePropertyPresenter display="Page Count" value={pages.length} />
            </div>
            <div className={styles['nav-link']}>
                <Link to={`/${routes.resources.ofType(ResourceType.book).detail(id)}`}>
                    <IconButton aria-label="navigate to resource" sx={{ ml: 0.5 }}>
                        <ArrowForwardIosIcon color="primary" />
                    </IconButton>
                </Link>
            </div>
            <FloatSpacerDiv />
        </>
    );
};
