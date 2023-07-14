import {
    IBibliographicReferenceViewModel,
    IJournalArticleBibliographicReferenceData,
    ResourceType,
} from '@coscrad/api-interfaces';
import {
    ExternalLinkPresenter,
    MultiplePropertyPresenter,
    PropertyLabels,
    SinglePropertyPresenter,
} from '../../../utils/generic-components';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { CreatorsPresenter } from './shared/creators-presenter';

export const JournalArticleBibliographicReferenceDetailFullViewPresenter = ({
    id,
    data,
}: IBibliographicReferenceViewModel<IJournalArticleBibliographicReferenceData>): JSX.Element => {
    const keysAndLabels: PropertyLabels<IJournalArticleBibliographicReferenceData> = {
        abstract: 'Abstract',
        publicationTitle: 'Publication Title',
        issueDate: 'Issue Date',
        issn: 'ISSN',
        doi: 'DOI',
    };

    // Temporary workaround until `name` is on IBaseViewModel
    const { title, creators, url } = data;

    const name = title;

    return (
        <ResourceDetailFullViewPresenter
            name={name}
            id={id}
            type={ResourceType.bibliographicReference}
        >
            {/* TODO: create label configuration for subtypes */}
            <SinglePropertyPresenter display="Reference Type" value="Journal Article" />
            <CreatorsPresenter creators={creators} />
            <MultiplePropertyPresenter keysAndLabels={keysAndLabels} data={data} />
            <ExternalLinkPresenter url={url} />
        </ResourceDetailFullViewPresenter>
    );
};
