import { IPlayListViewModel } from '@coscrad/api-interfaces';
import { PlaylistIndexState } from '../../../store/slices/resources/playlists/types';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { renderMultilingualTextCell } from '../utils/render-multilingual-text-cell';

export const PlaylistIndexPresenter = ({ entities: playlists }: PlaylistIndexState) => {
    const headingLabels: HeadingLabel<IPlayListViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'Link' },
        { propertyKey: 'episodes', headingLabel: 'Number of Episodes' },
        { propertyKey: 'name', headingLabel: 'Playlist' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<IPlayListViewModel> = {
        id: renderAggregateIdCell,
        name: ({ name }) => renderMultilingualTextCell(name),
        episodes: ({ episodes }) => episodes.length.toString(),
    };

    return (
        <IndexTable
            headingLabels={headingLabels}
            tableData={playlists}
            cellRenderersDefinition={cellRenderersDefinition}
            heading={'Episodes'}
            filterableProperties={['episodes', 'name']}
        />
    );
};
