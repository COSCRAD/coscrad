import {
    AggregateType,
    IMultilingualText,
    IVocabularyListViewModel,
} from '@coscrad/api-interfaces';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { VocabularyListIndexState } from '../../../store/slices/resources/vocabulary-lists/types/vocabulary-list-index-state';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { Matchers } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/filter-table-data';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { renderMultilingualTextCell } from '../utils/render-multilingual-text-cell';

export const VocabularyListIndexPresenter = ({
    entities: vocabularyLists,
}: VocabularyListIndexState) => {
    const { defaultUILanguageCode } = useContext(ConfigurableContentContext);

    const headingLabels: HeadingLabel<IVocabularyListViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'link' },
        { propertyKey: 'name', headingLabel: 'Vocabulary List' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<IVocabularyListViewModel> = {
        id: renderAggregateIdCell,
        name: ({ name }) => renderMultilingualTextCell(name, defaultUILanguageCode),
    };

    const matchers: Matchers<IVocabularyListViewModel> = {
        name: ({ items }: IMultilingualText, search) =>
            items.some(({ text }) => text.toLowerCase().includes(search.toLowerCase())),
    };

    return (
        <IndexTable
            type={AggregateType.vocabularyList}
            headingLabels={headingLabels}
            tableData={vocabularyLists}
            cellRenderersDefinition={cellRenderersDefinition}
            // This should be a resource label from resource info
            heading={'Vocabulary Lists'}
            filterableProperties={['name']}
            matchers={matchers}
        />
    );
};
