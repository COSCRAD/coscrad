import {
    IBibliographicReferenceViewModel,
    IJournalArticleBibliographicReferenceData,
    ResourceType,
} from '@coscrad/api-interfaces';
import { ResourceDetailThumbnailPresenter } from 'apps/coscrad-frontend/src/utils/generic-components/presenters/detail-views';

export const JournalArticleBibliographicReferenceThumbnailPresenter = ({
    id,
    data: { title, abstract, issueDate, publicationTitle },
}: IBibliographicReferenceViewModel<IJournalArticleBibliographicReferenceData>): JSX.Element => {
    const name = title;

    return (
        <ResourceDetailThumbnailPresenter
            id={id}
            name={name}
            type={ResourceType.bibliographicReference}
        >
            {publicationTitle} ({issueDate})
        </ResourceDetailThumbnailPresenter>
    );
};
