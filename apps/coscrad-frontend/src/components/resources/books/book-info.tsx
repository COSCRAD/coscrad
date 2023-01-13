import { IBookViewModel, ResourceType } from '@coscrad/api-interfaces';
import { routes } from '../../../app/routes/routes';
import { FloatSpacerDiv, SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceNavLink } from '../shared/resource-nav-link';
import styles from './book-info.module.scss';

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
                <SinglePropertyPresenter display="Pages" value={pages.length} />
            </div>
            <div className={styles['nav-link']}>
                <ResourceNavLink
                    linkURL={`/${routes.resources.ofType(ResourceType.book).detail(id)}`}
                />
            </div>
            <FloatSpacerDiv />
        </>
    );
};
