import {
    AggregateType,
    IMultilingualText,
    IMultilingualTextItem,
    IVideoViewModel,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { VideoIndexState } from '../../../store/slices/resources/video';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import {
    Matchers,
    doesTextIncludeCaseInsensitive,
} from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/filter-table-data';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { renderMultilingualTextItem } from '../utils/render-cell-for-single-language';
import { renderContributionsTextCell } from '../utils/render-contributions-text-cell';
import { renderMediaLengthInSeconds } from '../utils/render-media-length-in-seconds-cell';

const inLanguage = (languageCodeToFind: LanguageCode, multilingualText: IMultilingualText) =>
    multilingualText.items.find(({ languageCode }) => languageCode === languageCodeToFind);

type VideoTableRow = Omit<IVideoViewModel, 'name'> & {
    name: IMultilingualTextItem;
    nameEnglish: IMultilingualTextItem;
};

const createTableRowBuilder =
    (defaultLanguageCode: LanguageCode) =>
    (video: IVideoViewModel): VideoTableRow => ({
        ...video,
        name: inLanguage(defaultLanguageCode, video.name),
        nameEnglish: inLanguage(LanguageCode.English, video.name),
    });

export const VideoIndexPresenter = ({ entities: videos }: VideoIndexState): JSX.Element => {
    const { defaultUILanguageCode } = useContext(ConfigurableContentContext);

    const buildTableRow = createTableRowBuilder(defaultUILanguageCode);

    const headingLabels: HeadingLabel<VideoTableRow>[] = [
        { propertyKey: 'id', headingLabel: 'Link' },
        {
            propertyKey: 'lengthMilliseconds',
            headingLabel: 'Video Length',
        },
        { propertyKey: 'name', headingLabel: 'Name' },
        { propertyKey: 'nameEnglish', headingLabel: 'Name (English)' },
        { propertyKey: 'contributions', headingLabel: 'Contributors' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<VideoTableRow> = {
        id: renderAggregateIdCell,
        lengthMilliseconds: ({ lengthMilliseconds }) =>
            renderMediaLengthInSeconds(lengthMilliseconds),
        name: ({ name }) => (isNullOrUndefined(name) ? null : renderMultilingualTextItem(name)),
        nameEnglish: ({ nameEnglish }) =>
            isNullOrUndefined(nameEnglish) ? null : renderMultilingualTextItem(nameEnglish),
        contributions: ({ contributions }: VideoTableRow) =>
            renderContributionsTextCell(contributions),
    };

    // We may want to bring in the full MultilingualText class to the front-end and put this behaviour on a method instead
    const doesSearchTextMatchTextItemCaseInsensitive = (
        textItem: IMultilingualTextItem,
        searchText: string
    ) => {
        if (isNullOrUndefined(textItem)) return false;

        const { text } = textItem;

        return doesTextIncludeCaseInsensitive(text, searchText);
    };

    const matchers: Matchers<VideoTableRow> = {
        name: doesSearchTextMatchTextItemCaseInsensitive,
        nameEnglish: doesSearchTextMatchTextItemCaseInsensitive,
    };

    return (
        <IndexTable
            type={AggregateType.video}
            headingLabels={headingLabels}
            tableData={videos.map(buildTableRow)}
            cellRenderersDefinition={cellRenderersDefinition}
            heading={'Videos'}
            filterableProperties={['name', 'nameEnglish', 'contributions']}
            matchers={matchers}
        />
    );
};
