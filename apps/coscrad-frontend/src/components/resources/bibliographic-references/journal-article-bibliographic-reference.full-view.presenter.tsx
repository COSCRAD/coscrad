import {
    IBibliographicReferenceViewModel,
    IJournalArticleBibliographicReferenceData,
    ResourceType,
} from '@coscrad/api-interfaces';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { MultiPropertyPresenter } from '../../../utils/generic-components/presenters/multiple-property-presenter';

export type KeysAndLabels = {
    propertyKey: string;
    label: string;
};

export const JournalArticleBibliographicReferenceFullViewPresenter = ({
    id,
    data,
}: IBibliographicReferenceViewModel<IJournalArticleBibliographicReferenceData>): JSX.Element => {
    const keysAndLabels: KeysAndLabels[] = [
        // {
        //     propertyKey: 'creators',
        //     label: 'Creators',
        // },
        {
            propertyKey: 'abstract',
            label: 'Abstract',
        },
        {
            propertyKey: 'publicationTitle',
            label: 'Publication Title',
        },
        {
            propertyKey: 'issueDate',
            label: 'Issue Date',
        },
        {
            propertyKey: 'url',
            label: 'URL',
        },
        {
            propertyKey: 'issn',
            label: 'ISSN',
        },
        {
            propertyKey: 'doi',
            label: 'DOI',
        },
    ];

    // Temporary workaround until `name` is on IBaseViewModel
    const { title } = data;
    const name = title;

    return (
        <ResourceDetailFullViewPresenter
            name={name}
            id={id}
            type={ResourceType.bibliographicReference}
        >
            <MultiPropertyPresenter keysAndLabels={keysAndLabels} presenterData={data} />
        </ResourceDetailFullViewPresenter>
    );
};
