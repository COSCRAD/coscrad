import { AggregateType, IPlayListViewModel } from '@coscrad/api-interfaces';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { PlaylistIndexState } from '../../../store/slices/resources/playlists/types';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { Matchers } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/filter-table-data';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { renderMultilingualTextCell } from '../utils/render-multilingual-text-cell';

/***
 * TODO Unit test this logic and break it out
 */
const doesCountSatisfyStringCriterion = (input: number, stringCriterion: string): boolean => {
    if (typeof stringCriterion !== 'string' || stringCriterion.length === 0) return true;

    const firstChar = stringCriterion.charAt(0);

    if (['<', '>'].includes(firstChar)) {
        const valueToCompare = stringCriterion.slice(1, stringCriterion.length);

        if (valueToCompare.length === 0) return false;

        const integerValue = parseInt(valueToCompare);

        if (isNaN(integerValue)) return false;

        return firstChar === '>' ? input > integerValue : input < integerValue;
    }

    const integerValue = parseInt(stringCriterion);

    if (isNaN(integerValue)) return false;

    return integerValue === input;
};

export const PlaylistIndexPresenter = ({ entities: playlists }: PlaylistIndexState) => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const headingLabels: HeadingLabel<IPlayListViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'Link' },
        { propertyKey: 'episodes', headingLabel: 'Number of Episodes' },
        { propertyKey: 'name', headingLabel: 'Playlist' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<IPlayListViewModel> = {
        id: renderAggregateIdCell,
        name: ({ name }) => renderMultilingualTextCell(name, defaultLanguageCode),
        episodes: ({ episodes }) => episodes.length.toString(),
    };

    const matchers: Matchers<IPlayListViewModel> = {
        name: (multilingualText, searchString) =>
            multilingualText.items.some(({ text }) =>
                text.toLowerCase().includes(searchString.toLowerCase())
            ),
        episodes: (episodes, searchString) =>
            doesCountSatisfyStringCriterion(episodes.length, searchString),
    };

    return (
        <IndexTable
            type={AggregateType.playlist}
            headingLabels={headingLabels}
            tableData={playlists}
            cellRenderersDefinition={cellRenderersDefinition}
            heading={'Playlists'}
            filterableProperties={['episodes', 'name']}
            matchers={matchers}
        />
    );
};
