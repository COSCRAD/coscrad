import { IVocabularyListViewModel } from '@coscrad/api-interfaces';
import { VocabularyListIndexState } from '../../../store/slices/resources/vocabulary-lists/types/vocabulary-list-index-state';
import {
    HeadingLabel,
    IndexViewContainer,
} from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { formatBilingualText } from './utils';

export const VocabularyListIndexPresenter = ({
    entities: vocabularyLists,
}: VocabularyListIndexState) => {
    const headingLabels: HeadingLabel<IVocabularyListViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'link' },
        { propertyKey: 'name', headingLabel: 'Vocabulary List' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<IVocabularyListViewModel> = {
        id: renderAggregateIdCell,
        name: ({ name, nameEnglish }) => formatBilingualText(name, nameEnglish),
    };

    return (
        <IndexViewContainer
            headingLabels={headingLabels}
            indexViewData={vocabularyLists}
            cellRenderersDefinition={cellRenderersDefinition}
            // This should be a resource label from resource info
            heading={'Vocabulary Lists'}
            filterableProperties={['name', 'nameEnglish']}
        />
    );
};
