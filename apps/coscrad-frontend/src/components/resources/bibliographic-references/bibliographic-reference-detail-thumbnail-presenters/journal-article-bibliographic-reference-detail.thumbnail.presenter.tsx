import {
    IBibliographicReferenceViewModel,
    IJournalArticleBibliographicReferenceData,
    ResourceType,
} from '@coscrad/api-interfaces';
import {
    ResourceDetailThumbnailPresenter,
    SinglePropertyPresenter,
} from '../../../../utils/generic-components/';

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
            <SinglePropertyPresenter display="Reference Type" value="Journal Article" />
            {publicationTitle} ({issueDate})
        </ResourceDetailThumbnailPresenter>
    );
};
