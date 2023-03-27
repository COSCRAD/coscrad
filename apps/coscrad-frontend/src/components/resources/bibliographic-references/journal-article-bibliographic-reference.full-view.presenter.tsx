import {
    BibliographicReferenceType,
    IBibliographicReferenceViewModel,
    IJournalArticleBibliographicReferenceData,
    IValueAndDisplay,
    ResourceType,
} from '@coscrad/api-interfaces';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';

export const JournalArticleBibliographicReferenceFullViewPresenter = ({
    id,
    data: { title, abstract, issueDate, publicationTitle, url, issn, doi },
}: IBibliographicReferenceViewModel<IJournalArticleBibliographicReferenceData>): JSX.Element => {
    const labelsAndValues: IValueAndDisplay<unknown>[] = (
        [
            [abstract, 'Abstract'],
            [issueDate, 'Date'],
            [publicationTitle, 'Publication'],
            // TODO format as link
            [url, 'External Link'],
            [issn, 'ISSN'],
            [doi, 'DOI'],
            // TODO expose creators
        ] as const
    )
        // Do not present optional values
        .filter(([value, _]) => value !== null && typeof value !== 'undefined')
        .map(([value, display]) => ({
            value,
            display,
        }));

    const name = title;

    return (
        <ResourceDetailFullViewPresenter
            name={name}
            id={id}
            type={ResourceType.bibliographicReference}
        >
            <SinglePropertyPresenter display="Title" value={title} />
            <SinglePropertyPresenter
                display="Reference Type"
                value={BibliographicReferenceType.journalArticle}
            />
            {labelsAndValues
                .filter(({ value }) => value !== null && typeof value !== 'undefined')
                .map((valueAndDisplay) => (
                    <SinglePropertyPresenter {...valueAndDisplay} key={valueAndDisplay.display} />
                ))}
        </ResourceDetailFullViewPresenter>
    );
};
