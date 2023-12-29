import {
    IBibliographicCitationViewModel,
    ICourtCaseBibliographicCitationData,
    ResourceType,
} from '@coscrad/api-interfaces';
import {
    MultiplePropertyPresenter,
    PropertyLabels,
    SinglePropertyPresenter,
} from '../../../../utils/generic-components/presenters';
import { ResourceDetailThumbnailPresenter } from '../../../../utils/generic-components/presenters/detail-views';

export const CourtCaseBibliographicCitationDetailThumbnailPresenter = ({
    id,
    data,
}: IBibliographicCitationViewModel<ICourtCaseBibliographicCitationData>): JSX.Element => {
    const keysAndLabels: PropertyLabels<ICourtCaseBibliographicCitationData> = {
        dateDecided: 'Date Decided',
        court: 'Court',
    };

    // Temporary workaround until `name` is on IBaseViewModel
    const { caseName } = data;

    const name = caseName;

    return (
        <ResourceDetailThumbnailPresenter
            id={id}
            name={name}
            type={ResourceType.bibliographicCitation}
        >
            <SinglePropertyPresenter display="Citation Type" value="Court Case" />
            <MultiplePropertyPresenter keysAndLabels={keysAndLabels} data={data} />
        </ResourceDetailThumbnailPresenter>
    );
};
