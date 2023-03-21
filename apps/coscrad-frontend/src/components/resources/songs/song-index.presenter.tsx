import { ISongViewModel } from '@coscrad/api-interfaces';
import { SongIndexState } from '../../../store/slices/resources/songs/types';
import {
    HeadingLabel,
    IndexViewContainer,
} from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { formatBilingualText } from '../vocabulary-lists/utils';

export const SongIndexPresenter = ({ entities: songs }: SongIndexState) => {
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
        <IndexViewContainer
            headingLabels={headingLabels}
            indexViewData={songs}
            cellRenderersDefinition={cellRenderersDefinition}
            heading={'Songs'}
            filterableProperties={['lyrics', 'title', 'titleEnglish']}
        />
    );
};
