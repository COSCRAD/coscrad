import {
    ICategorizableDetailQueryResult,
    IPlaylistEpisode,
    IPlayListViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
import { useState } from 'react';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { ContextProps } from '../factories/full-view-categorizable-presenter-factory';
import { renderAggregateUrlCell } from '../utils/render-audio-preview';

export const PlaylistDetailFullViewPresenter = ({
    name,
    id,
    episodes,
}: ICategorizableDetailQueryResult<IPlayListViewModel> & ContextProps): JSX.Element => {
    const [_url, setUrl] = useState<string | null>(null);

    const headingLabels: HeadingLabel<IPlaylistEpisode>[] = [
        {
            propertyKey: 'name',
            headingLabel: 'Name',
        },
        {
            propertyKey: 'mediaItemUrl',
            headingLabel: 'Audio',
        },
    ];

    const cellRenderers: CellRenderersDefinition<IPlaylistEpisode> = {
        // TODO Consider making the name property `MultilingualText`
        // name: ({ name }) => renderMultilingualTextCell(name),
        mediaItemUrl: ({ mediaItemUrl }) =>
            renderAggregateUrlCell(mediaItemUrl, (url: string) => setUrl(url)),
    };

    return (
        <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.playlist}>
            <Typography component={'div'}>
                <Typography variant={'h5'}> Episodes </Typography>
                <IndexTable
                    headingLabels={headingLabels}
                    tableData={episodes}
                    cellRenderersDefinition={cellRenderers}
                    heading={'Episodes'}
                    filterableProperties={['name']}
                />
            </Typography>
        </ResourceDetailFullViewPresenter>
    );
};
