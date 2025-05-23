import {
    AggregateType,
    ICategorizableDetailQueryResult,
    IPlaylistEpisode,
    IPlayListViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
import { useContext, useState } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateUrlCell } from '../utils/render-audio-preview';
import { renderMultilingualTextCell } from '../utils/render-multilingual-text-cell';

export const PlaylistDetailFullViewPresenter = ({
    name,
    id,
    episodes,
    contributions,
}: ICategorizableDetailQueryResult<IPlayListViewModel>): JSX.Element => {
    const [_url, setUrl] = useState<string | null>(null);

    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

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
        name: ({ name }) => renderMultilingualTextCell(name, defaultLanguageCode),
        mediaItemUrl: ({ mediaItemUrl }) =>
            renderAggregateUrlCell(mediaItemUrl, (url: string) => setUrl(url)),
    };

    return (
        <ResourceDetailFullViewPresenter
            name={name}
            id={id}
            type={ResourceType.playlist}
            contributions={contributions}
        >
            <Typography component={'div'}>
                <Typography variant={'h5'}> Episodes </Typography>
                <IndexTable
                    type={AggregateType.playlist}
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
