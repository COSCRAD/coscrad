import { BibliographicReferenceIndexState } from '../../../store/slices/resources';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import {
    BibliographicReferenceJointViewModel,
    buildBibliographicReferenceJointViewModel,
} from './joint-view';

export const BibliographicReferenceIndexPresenter = ({
    data: detailResult,
}: BibliographicReferenceIndexState) => {
    const consolidatedViewOfBibliographicReferences = detailResult
        .map(({ data }) => data)
        .map(buildBibliographicReferenceJointViewModel);

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
        <IndexTable
            headingLabels={headingLabels}
            tableData={consolidatedViewOfBibliographicReferences}
            cellRenderersDefinition={cellRenderersDefinition}
            heading="Bibliographic References"
        />
    );
};