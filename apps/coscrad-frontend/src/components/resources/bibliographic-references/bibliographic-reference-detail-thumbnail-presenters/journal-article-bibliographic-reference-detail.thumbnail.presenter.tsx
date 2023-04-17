import {
    BibliographicReferenceType,
    IBibliographicReferenceViewModel,
    IJournalArticleBibliographicReferenceData,
    ResourceType,
} from '@coscrad/api-interfaces';
import {
    ResourceDetailThumbnailPresenter,
    SinglePropertyPresenter,
} from '../../../../utils/generic-components/';

/**
 * NOTE: currently there is no way to view the journal article thumbnail to check that
 * it's displaying properly because there is no existing dual edge connection that
 * includes the journal article bibliographic reference type.
 */

export const JournalArticleBibliographicReferenceThumbnailPresenter = ({
    id,
    data: { title, issueDate, publicationTitle },
}: IBibliographicReferenceViewModel<IJournalArticleBibliographicReferenceData>): JSX.Element => {
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
            {publicationTitle} ({issueDate})
        </ResourceDetailThumbnailPresenter>
    );
};
