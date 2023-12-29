import { AggregateType } from '@coscrad/api-interfaces';
import { BibliographicCitationIndexState } from '../../../store/slices/resources';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import {
    BibliographicCitationJointViewModel,
    buildBibliographicCitationJointViewModel,
} from './joint-view';

export const BibliographicCitationIndexPresenter = ({
    entities,
}: BibliographicCitationIndexState) => {
    const consolidatedViewOfBibliographicCitations = entities.map(
        buildBibliographicCitationJointViewModel
    );

    const headingLabels: HeadingLabel<BibliographicCitationJointViewModel>[] = [
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

    const cellRenderersDefinition: CellRenderersDefinition<BibliographicCitationJointViewModel> = {
        id: renderAggregateIdCell,
        /**
         * We have already mapped all data to strings, so we don't need any
         * custom renderers.
         */
    };

    return (
        <IndexTable
            type={AggregateType.bibliographicCitation}
            headingLabels={headingLabels}
            tableData={consolidatedViewOfBibliographicCitations}
            cellRenderersDefinition={cellRenderersDefinition}
            heading="Bibliographic References"
            filterableProperties={['title', 'citation', 'type']}
        />
    );
};
