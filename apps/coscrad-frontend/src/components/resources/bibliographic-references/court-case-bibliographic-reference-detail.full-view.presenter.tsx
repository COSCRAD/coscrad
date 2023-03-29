import {
    IBibliographicReferenceViewModel,
    ICourtCaseBibliographicReferenceData,
    ResourceType,
} from '@coscrad/api-interfaces';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { ExternalLinkPresenter } from '../../../utils/generic-components/presenters/external-link-presenter';
import {
    MultiplePropertyPresenter,
    PropertyLabels,
} from '../../../utils/generic-components/presenters/multiple-property-presenter';

export const CourtCaseBibliographicReferenceDetailFullViewPresenter = ({
    id,
    data,
}: IBibliographicReferenceViewModel<ICourtCaseBibliographicReferenceData>): JSX.Element => {
    const keysAndLabels: PropertyLabels<ICourtCaseBibliographicReferenceData> = {
        abstract: 'Abstract',
        dateDecided: 'Date Decided',
        court: 'Court',
        pages: 'Pages',
    };

    // Temporary workaround until `name` is on IBaseViewModel
    const { caseName, url } = data;
    const name = caseName;

    return (
        <ResourceDetailFullViewPresenter
            name={name}
            id={id}
            type={ResourceType.bibliographicReference}
        >
            {/* TODO: create label configuration for subtypes */}
            <SinglePropertyPresenter display="Reference Type" value="Journal Article" />
            <MultiplePropertyPresenter keysAndLabels={keysAndLabels} data={data} />
            <ExternalLinkPresenter url={url} />
        </ResourceDetailFullViewPresenter>
    );
};
