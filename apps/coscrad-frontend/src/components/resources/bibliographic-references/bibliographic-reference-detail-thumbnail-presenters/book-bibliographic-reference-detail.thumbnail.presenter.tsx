import {
    IBibliographicReferenceViewModel,
    IBookBibliographicReferenceData,
    ResourceType,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { ResourceDetailThumbnailPresenter } from 'apps/coscrad-frontend/src/utils/generic-components/presenters/detail-views';

export const BookBibliographicReferenceDetailThumbnailPresenter = ({
    id,
    data: { title, numberOfPages, year },
}: IBibliographicReferenceViewModel<IBookBibliographicReferenceData>): JSX.Element => {
    const name = title;

    return (
        <ResourceDetailThumbnailPresenter
            id={id}
            name={name}
            type={ResourceType.bibliographicReference}
        >
            {!isNullOrUndefined(numberOfPages) && <div>{numberOfPages} pages</div>}
            {!isNullOrUndefined(year) && <div>({year})</div>}
        </ResourceDetailThumbnailPresenter>
    );
};
