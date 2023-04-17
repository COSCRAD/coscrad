import {
    BibliographicReferenceType,
    IBibliographicReferenceViewModel,
    ICourtCaseBibliographicReferenceData,
    ResourceType,
} from '@coscrad/api-interfaces';
import {
    MultiplePropertyPresenter,
    PropertyLabels,
    SinglePropertyPresenter,
} from '../../../../utils/generic-components/presenters/';
import { ResourceDetailThumbnailPresenter } from '../../../../utils/generic-components/presenters/detail-views';

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
            <SinglePropertyPresenter
                display="Reference Type"
                value={BibliographicReferenceType.book}
            />
            <MultiplePropertyPresenter keysAndLabels={keysAndLabels} data={data} />
        </ResourceDetailThumbnailPresenter>
    );
};
