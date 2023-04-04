import {
    IBibliographicReferenceViewModel,
    ICourtCaseBibliographicReferenceData,
    ResourceType,
} from '@coscrad/api-interfaces';
import { ResourceDetailThumbnailPresenter } from '../../../../utils/generic-components/presenters/detail-views';

export const CourtCaseBibliographicReferenceDetailThumbnailPresenter = ({
    id,
    data: { caseName, abstract, dateDecided, pages },
}: IBibliographicReferenceViewModel<ICourtCaseBibliographicReferenceData>): JSX.Element => {
    const name = caseName;

    return (
        <ResourceDetailThumbnailPresenter
            id={id}
            name={name}
            type={ResourceType.bibliographicReference}
        >
            {/* <IfDefined value={pages}>
                <div>{pages} pages</div>
            </IfDefined> */}
            {dateDecided && <div>({dateDecided})</div>}
        </ResourceDetailThumbnailPresenter>
    );
};
