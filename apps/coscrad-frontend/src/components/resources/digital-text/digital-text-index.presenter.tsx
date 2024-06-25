import { AggregateType, IDigitalTextViewModel } from '@coscrad/api-interfaces';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { DigitalTextIndexState } from '../../../store/slices/resources';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { renderMultilingualTextCell } from '../utils/render-multilingual-text-cell';

export const DigitalTextIndexPresenter = ({
    entities: digitalTexts,
}: DigitalTextIndexState): JSX.Element => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const headingLabels: HeadingLabel<IDigitalTextViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'Link' },
        { propertyKey: 'title', headingLabel: 'Title' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<IDigitalTextViewModel> = {
        id: renderAggregateIdCell,
        title: ({ title }: IDigitalTextViewModel) =>
            renderMultilingualTextCell(title, defaultLanguageCode),
    };

    return (
        <IndexTable
            type={AggregateType.digitalText}
            headingLabels={headingLabels}
            tableData={digitalTexts}
            cellRenderersDefinition={cellRenderersDefinition}
            // This should be a resource label from resource info
            heading={'Digital Texts'}
            filterableProperties={['title']}
        />
    );
};
