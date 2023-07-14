import {
    IBibliographicReferenceViewModel,
    ICourtCaseBibliographicReferenceData,
    ResourceType,
} from '@coscrad/api-interfaces';
import {
    ExternalLinkPresenter,
    MultiplePropertyPresenter,
    PropertyLabels,
    SinglePropertyPresenter,
} from '../../../utils/generic-components/';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';

export const CourtCaseBibliographicReferenceDetailFullViewPresenter = ({
    id,
    data,
}: IBibliographicReferenceViewModel<ICourtCaseBibliographicReferenceData>): JSX.Element => {
    const keysAndLabels: PropertyLabels<ICourtCaseBibliographicReferenceData> = {
        abstract: 'Abstract',
        dateDecided: 'Date Decided',
        court: 'Court',
        pages: 'First Page',
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
            <SinglePropertyPresenter display="Reference Type" value="Court Case" />
            <MultiplePropertyPresenter keysAndLabels={keysAndLabels} data={data} />
            <ExternalLinkPresenter url={url} />
        </ResourceDetailFullViewPresenter>
    );
};
