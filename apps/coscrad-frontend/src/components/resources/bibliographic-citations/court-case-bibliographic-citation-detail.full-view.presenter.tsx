import {
    IBibliographicCitationViewModel,
    ICourtCaseBibliographicCitationData,
    IMultilingualText,
    LanguageCode,
    MultilingualTextItemRole,
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
}: IBibliographicCitationViewModel<ICourtCaseBibliographicCitationData>): JSX.Element => {
    const keysAndLabels: PropertyLabels<ICourtCaseBibliographicCitationData> = {
        abstract: 'Abstract',
        dateDecided: 'Date Decided',
        court: 'Court',
        pages: 'First Page',
    };

    // Temporary workaround until `name` is on IBaseViewModel
    const { caseName, url } = data;
    const name: IMultilingualText = {
        items: [
            {
                languageCode: LanguageCode.English,
                text: caseName,
                role: MultilingualTextItemRole.original,
            },
        ],
    };

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
