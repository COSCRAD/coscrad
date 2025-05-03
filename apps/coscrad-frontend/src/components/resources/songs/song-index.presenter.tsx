import { AggregateType, ISongViewModel } from '@coscrad/api-interfaces';
import { AudioClipPlayer } from '@coscrad/media-player';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { LinkOff } from '@mui/icons-material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { SongIndexState } from '../../../store/slices/resources/songs/types';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { Matchers } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/filter-table-data';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { doesSomeMultilingualTextItemInclude } from '../utils/query-matchers';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { renderContributionsTextCell } from '../utils/render-contributions-text-cell';
import { renderMultilingualTextCell } from '../utils/render-multilingual-text-cell';

export const SongIndexPresenter = (songsIndexResult: SongIndexState) => {
    const { defaultUILanguageCode } = useContext(ConfigurableContentContext);

    const { entities: songs } = songsIndexResult;

    const headingLabels: HeadingLabel<ISongViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'Link' },
        { propertyKey: 'name', headingLabel: 'Title' },
        { propertyKey: 'audioURL', headingLabel: 'Audio' },
        { propertyKey: 'contributions', headingLabel: 'Contributors' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<ISongViewModel> = {
        id: renderAggregateIdCell,
        name: ({ name }: ISongViewModel) => renderMultilingualTextCell(name, defaultUILanguageCode),
        audioURL: ({ audioURL }: ISongViewModel) =>
            isNullOrUndefined(audioURL) ? <LinkOff /> : <AudioClipPlayer audioUrl={audioURL} />,
        contributions: ({ contributions }: ISongViewModel) =>
            renderContributionsTextCell(contributions),
    };

    const matchers: Matchers<ISongViewModel> = {
        name: doesSomeMultilingualTextItemInclude,
    };

    return (
        <IndexTable
            type={AggregateType.song}
            headingLabels={headingLabels}
            tableData={songs}
            cellRenderersDefinition={cellRenderersDefinition}
            heading={'Songs'}
            filterableProperties={['name', 'contributions']}
            matchers={matchers}
        />
    );
};
