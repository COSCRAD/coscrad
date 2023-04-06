import {
    IBibliographicReferenceViewModel,
    IBookBibliographicReferenceData,
    ResourceType,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { SinglePropertyPresenter } from 'apps/coscrad-frontend/src/utils/generic-components';
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
            <SinglePropertyPresenter display="Pages" value={numberOfPages} />
            {/* TODO: streamline the null or undefined check */}
            {!isNullOrUndefined(year) && <div>({year})</div>}
        </ResourceDetailThumbnailPresenter>
    );
};
