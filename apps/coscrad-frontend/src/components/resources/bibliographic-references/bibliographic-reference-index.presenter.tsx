import { CoscradMainContentContainer } from 'apps/coscrad-frontend/src/utils/generic-components/style-components/coscrad-main-content-container';
import { BibliographicReferenceIndexState } from '../../../store/slices/resources';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import {
    BibliographicReferenceJointViewModel,
    buildBibliographicReferenceJointViewModel,
} from './joint-view';

export const BibliographicReferenceIndexPresenter = ({
    entities,
}: BibliographicReferenceIndexState) => {
    const consolidatedViewOfBibliographicReferences = entities.map(
        buildBibliographicReferenceJointViewModel
    );

    const headingLabels: HeadingLabel<BibliographicReferenceJointViewModel>[] = [
        {
            propertyKey: 'id',
            headingLabel: 'LINK',
        },
        {
            propertyKey: 'type',
            headingLabel: 'Reference Type',
        },
        {
            propertyKey: 'title',
            headingLabel: 'Title',
        },
        {
            propertyKey: 'citation',
            headingLabel: 'Citation',
        },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<BibliographicReferenceJointViewModel> = {
        id: renderAggregateIdCell,
        /**
         * We have already mapped all data to strings, so we don't need any
         * custom renderers.
         */
    };

    return (
        <CoscradMainContentContainer>
            <IndexTable
                headingLabels={headingLabels}
                tableData={consolidatedViewOfBibliographicReferences}
                cellRenderersDefinition={cellRenderersDefinition}
                heading="Bibliographic References"
                filterableProperties={['title', 'citation', 'type']}
            />
        </CoscradMainContentContainer>
    );
};
