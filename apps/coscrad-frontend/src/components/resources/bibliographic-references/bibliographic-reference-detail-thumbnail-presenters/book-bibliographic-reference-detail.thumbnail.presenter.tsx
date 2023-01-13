import {
    IBibliographicReferenceViewModel,
    IBookBibliographicReferenceData,
    ResourceType,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Card, CardContent } from '@mui/material';
import { routes } from '../../../../app/routes/routes';
import { FloatSpacerDiv, SinglePropertyPresenter } from '../../../../utils/generic-components';
import { ResourceNavLink } from '../../shared/resource-nav-link';
import { ResourcePreview } from '../../shared/resource-preview';
import styles from './book-bibliographic-reference-detail.thumbnail.presenter.module.scss';

export const BookBibliographicReferenceDetailThumbnailPresenter = ({
    id,
    data: { title, numberOfPages, year },
}: IBibliographicReferenceViewModel<IBookBibliographicReferenceData>): JSX.Element => (
    <Card>
        <CardContent>
            <div data-testid={id} className={styles['preview']}>
                <ResourcePreview resourceType={ResourceType.bibliographicReference} />
            </div>
            <div className={styles['meta']}>
                {title}
                <SinglePropertyPresenter display="Transcribed Audio ID" value={id} />

                {/* TODO We should have an `OptionalProperty` helper */}
                {!isNullOrUndefined(numberOfPages) && (
                    <SinglePropertyPresenter display="Pages" value={numberOfPages} />
                )}
                {!isNullOrUndefined(year) && (
                    <SinglePropertyPresenter display="Year" value={year} />
                )}
            </div>
            <div className={styles['resource-nav-link']}>
                <ResourceNavLink
                    linkURL={`/${routes.resources
                        .ofType(ResourceType.bibliographicReference)
                        .detail(id)}`}
                />
            </div>
            <FloatSpacerDiv />
        </CardContent>
    </Card>
);
