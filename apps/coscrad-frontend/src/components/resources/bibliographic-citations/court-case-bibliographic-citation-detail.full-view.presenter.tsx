import {
    IBibliographicCitationViewModel,
    ICourtCaseBibliographicCitationData,
    ResourceType,
} from '@coscrad/api-interfaces';
import {
    ExternalLinkPresenter,
    MultiplePropertyPresenter,
    PropertyLabels,
    SinglePropertyPresenter,
} from '../../../utils/generic-components';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';

export const CourtCaseBibliographicCitationDetailFullViewPresenter = ({
    id,
    data,
    contributions,
    name,
}: IBibliographicCitationViewModel<ICourtCaseBibliographicCitationData>): JSX.Element => {
    const keysAndLabels: PropertyLabels<ICourtCaseBibliographicCitationData> = {
        abstract: 'Abstract',
        dateDecided: 'Date Decided',
        court: 'Court',
        pages: 'First Page',
    };

    const { url } = data;

    return (
        <ResourceDetailFullViewPresenter
            name={name}
            id={id}
            type={ResourceType.bibliographicCitation}
            contributions={contributions}
        >
            {/* TODO: create label configuration for subtypes */}
            <SinglePropertyPresenter display="Citation Type" value="Court Case" />
            <MultiplePropertyPresenter keysAndLabels={keysAndLabels} data={data} />
            <ExternalLinkPresenter url={url} />
        </ResourceDetailFullViewPresenter>
    );
};
