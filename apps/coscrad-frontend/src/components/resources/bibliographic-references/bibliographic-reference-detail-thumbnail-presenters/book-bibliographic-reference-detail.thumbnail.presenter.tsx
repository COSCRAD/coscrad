import {
    BibliographicReferenceType,
    IBibliographicReferenceViewModel,
    IBookBibliographicReferenceData,
    ResourceType,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import {
    ResourceDetailThumbnailPresenter,
    SinglePropertyPresenter,
} from '../../../../utils/generic-components';

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
            <SinglePropertyPresenter
                display="Reference Type"
                value={BibliographicReferenceType.book}
            />
            <SinglePropertyPresenter display="Pages" value={numberOfPages} />
            {/* TODO: streamline the null or undefined check */}
            {!isNullOrUndefined(year) && <div>({year})</div>}
        </ResourceDetailThumbnailPresenter>
    );
};
