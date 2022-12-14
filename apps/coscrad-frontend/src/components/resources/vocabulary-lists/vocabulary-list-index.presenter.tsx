import { IIndexQueryResult, IVocabularyListViewModel } from '@coscrad/api-interfaces';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { formatBilingualText } from './utils';

export const VocabularyListIndexPresenter = ({
    data: vocabularyListsAndActions,
}: IIndexQueryResult<IVocabularyListViewModel>) => {
    /**
     * TODO [https://www.pivotaltracker.com/story/show/183681556]
     * Remove the need to map here.
     */
    const vocabularyLists = vocabularyListsAndActions.map(({ data }) => data);

    const headingLabels: HeadingLabel<IVocabularyListViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'link' },
        { propertyKey: 'name', headingLabel: 'Vocabulary List' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<IVocabularyListViewModel> = {
        id: renderAggregateIdCell,
        name: ({ name, nameEnglish }) => formatBilingualText(name, nameEnglish),
    };

    return (
        <IndexTable
            headingLabels={headingLabels}
            tableData={vocabularyLists}
            cellRenderersDefinition={cellRenderersDefinition}
            // This should be a resource label from resource info
            heading={'Vocabulary Lists'}
            filterableProperties={['name', 'nameEnglish']}
        />
    );
};
