import { IPlayListViewModel } from '@coscrad/api-interfaces';
import { PlaylistIndexState } from '../../../store/slices/resources/playlists/types';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';

import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderMultilingualTextCell } from '../utils/render-multilingual-text-cell';

export const PlaylistIndexPresenter = ({ entities: playlists }: PlaylistIndexState) => {
    const headingLabels: HeadingLabel<IPlayListViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'link' },
        { propertyKey: 'episodes', headingLabel: 'episode' },
        { propertyKey: 'name', headingLabel: 'Playlist' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<IPlayListViewModel> = {
        id: renderAggregateIdCell,
        name: ({ name }) => renderMultilingualTextCell(name),
    };

    return (
        <IndexTable
            headingLabels={headingLabels}
            tableData={playlists}
            cellRenderersDefinition={cellRenderersDefinition}
            heading={'Episodes'}
            filterableProperties={['episodes']}
        />
    );
};
