import {
    AggregateType,
    ICategorizableDetailQueryResult,
    IPlayListViewModel,
    ResourceType
} from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { IndexTable } from '../../../utils/generic-components/presenters/tables';

export const PlaylistDetailFullViewPresenter = ({
    name,
    id,
    episodes,
}: ICategorizableDetailQueryResult<IPlayListViewModel>): JSX.Element => {
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
