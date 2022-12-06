import { IIndexQueryResult, IMediaItemViewModel } from '@coscrad/api-interfaces';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';

export const MediaItemIndexPresenter = (
    mediaIndexResult: IIndexQueryResult<IMediaItemViewModel>
) => {
    const { data: detailResult } = mediaIndexResult;

    const medias = detailResult.map(({ data }) => data);

    const headingLabels: HeadingLabel<IMediaItemViewModel>[] = [
        {
            propertyKey: 'title',
            headingLabel: 'Title',
        },
        {
            propertyKey: 'titleEnglish',
            headingLabel: 'English',
        },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<IMediaItemViewModel> = {
        title: renderAggregateIdCell,
        titleEnglish: ({ titleEnglish }: IMediaItemViewModel) => titleEnglish,
    };

    return (
        <IndexTable
            headingLabels={headingLabels}
            tableData={medias}
            cellRenderersDefinition={cellRenderersDefinition}
            heading={'Media'}
        />
    );
};
