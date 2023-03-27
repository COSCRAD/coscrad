import {
    IBibliographicReferenceViewModel,
    ICourtCaseBibliographicReferenceData,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Divider } from '@mui/material';
import { ResourceDetailThumbnailPresenter } from 'apps/coscrad-frontend/src/utils/generic-components/presenters/detail-views';
import { Abstract } from './abstract';

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
            {pages && <div>{pages} pages</div>}
            {dateDecided && <div>({dateDecided})</div>}
            <Divider />
            {abstract !== null && typeof abstract !== undefined && <Abstract abstract={abstract} />}
        </ResourceDetailThumbnailPresenter>
    );
};
