import {
    IBibliographicCitationViewModel,
    IJournalArticleBibliographicCitationData,
    ResourceType,
} from '@coscrad/api-interfaces';
import {
    ResourceDetailThumbnailPresenter,
    SinglePropertyPresenter,
} from '../../../../utils/generic-components';

export const JournalArticleBibliographicCitationThumbnailPresenter = ({
    id,
    data: { title, issueDate, publicationTitle },
}: IBibliographicCitationViewModel<IJournalArticleBibliographicCitationData>): JSX.Element => {
    const name = title;

    return (
        <ResourceDetailThumbnailPresenter
            id={id}
            name={name}
            type={ResourceType.bibliographicCitation}
        >
            <SinglePropertyPresenter display="Citation Type" value="Journal Article" />
            {publicationTitle} ({issueDate})
        </ResourceDetailThumbnailPresenter>
    );
};
