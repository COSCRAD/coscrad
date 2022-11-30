import { IIndexQueryResult, ISongViewModel } from '@coscrad/api-interfaces';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';

export const SongIndexPresenter = (songsIndexResult: IIndexQueryResult<ISongViewModel>) => {
    /**
     *  TODO [https://www.pivotaltracker.com/story/show/183681839]
     * We may some day read the actions and allow for bulk command execution in
     * an index view.
     */

    const { data: detailResult } = songsIndexResult;

    const songs = detailResult.map(({ data }) => data);

    const headingLabels: HeadingLabel<ISongViewModel>[] = [
        { propertyKey: 'title', headingLabel: 'Title' },
        { propertyKey: 'titleEnglish', headingLabel: 'English' },
        // { propertyKey: 'audioURL', headingLabel: 'Audio' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<ISongViewModel> = {
        title: renderAggregateIdCell,
        titleEnglish: ({ titleEnglish }: ISongViewModel) => titleEnglish,
        // audioURL: ({ audioURL }: ISongViewModel) => audioURL,
    };

    return (
        <IndexTable
            headingLabels={headingLabels}
            tableData={songs}
            cellRenderersDefinition={cellRenderersDefinition}
            heading={'Songs'}
        />
    );
};
