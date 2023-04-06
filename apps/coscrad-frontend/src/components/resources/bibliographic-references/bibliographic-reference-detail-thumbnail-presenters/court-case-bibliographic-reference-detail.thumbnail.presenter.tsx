import {
    IBibliographicReferenceViewModel,
    ICourtCaseBibliographicReferenceData,
    ResourceType,
} from '@coscrad/api-interfaces';
import { ResourceDetailThumbnailPresenter } from '../../../../utils/generic-components/presenters/detail-views';
import {
    MultiplePropertyPresenter,
    PropertyLabels,
} from '../../../../utils/generic-components/presenters/multiple-property-presenter';

export const CourtCaseBibliographicReferenceDetailThumbnailPresenter = ({
    id,
    data,
}: IBibliographicReferenceViewModel<ICourtCaseBibliographicReferenceData>): JSX.Element => {
    const keysAndLabels: PropertyLabels<ICourtCaseBibliographicReferenceData> = {
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
            type={ResourceType.bibliographicReference}
        >
            <MultiplePropertyPresenter keysAndLabels={keysAndLabels} data={data} />
        </ResourceDetailThumbnailPresenter>
    );
};
