import { IIndexQueryResult, ISongViewModel } from '@coscrad/api-interfaces';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { formatBilingualText } from '../vocabulary-lists/utils/formatBilingualText';

export const SongIndexPresenter = ({ entities: songs }: IIndexQueryResult<ISongViewModel>) => {
    const headingLabels: HeadingLabel<ISongViewModel>[] = [
        { propertyKey: 'title', headingLabel: 'Title' },
        { propertyKey: 'titleEnglish', headingLabel: 'English' },
        // { propertyKey: 'audioURL', headingLabel: 'Audio' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<ISongViewModel> = {
        title: renderAggregateIdCell,
        titleEnglish: ({ titleEnglish, title }) => formatBilingualText(titleEnglish, title),
        // audioURL: ({ audioURL }: ISongViewModel) => audioURL,
    };

    return (
        <IndexTable
            headingLabels={headingLabels}
            tableData={songs}
            cellRenderersDefinition={cellRenderersDefinition}
            heading={'Songs'}
            filterableProperties={['lyrics', 'title', 'titleEnglish']}
        />
    );
};
