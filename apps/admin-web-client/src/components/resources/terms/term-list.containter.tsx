import {
    AggregateType,
    IMultilingualText,
    ITermViewModel,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { AudioClipPlayer } from '@coscrad/media-player';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { LinkOff } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { CommaSeparatedList } from '../../shared/comma-separated-list';
import { HeadingLabel } from '../../tables';
import { CellRenderersDefinition } from '../../tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../../tables/render-aggregate-id-cell';
import { renderContributionsTextCell } from '../../tables/render-contributions-text-cell';
import { renderMultilingualTextCell } from '../../tables/render-multilingual-text-cell';
import { useFetchTermsQuery } from './store';
import { getOriginalTextItem } from './term-detail.page';
import { TermIndexTable } from './term-index-table';

export const findOriginalMultilingualTextItem = (name: IMultilingualText) => {
    const item = name.items.find((item) => item.role === MultilingualTextItemRole.original);

    return item;
};

export const TermIndex = (): JSX.Element => {
    const { data, isLoading, isError } = useFetchTermsQuery();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) return <div>Error retrieving name.</div>;

    const { entities } = data;

    const headingLabels: HeadingLabel<ITermViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'Link' },
        { propertyKey: 'name', headingLabel: 'Term' },
        { propertyKey: 'audioURL', headingLabel: 'Audio' },
        { propertyKey: 'contributions', headingLabel: 'Contributors' },
        { propertyKey: 'vocabularyLists', headingLabel: 'Vocabulary Lists' },
        { propertyKey: 'tokens', headingLabel: 'Letters' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<ITermViewModel> = {
        id: renderAggregateIdCell,
        // TODO We need to determine the `term` and `termEnglish` from a multilingual text property
        name: ({ name }: ITermViewModel) => renderMultilingualTextCell(name, LanguageCode.English),
        audioURL: ({ audioURL }: ITermViewModel) =>
            isNullOrUndefined(audioURL) ? (
                <LinkOff color="primary" />
            ) : (
                <AudioClipPlayer audioUrl={audioURL} />
            ),
        contributions: ({ contributions }: ITermViewModel) =>
            renderContributionsTextCell(contributions),
        vocabularyLists: ({ vocabularyLists }: ITermViewModel) => (
            <CommaSeparatedList>
                {vocabularyLists.map(({ name }) => (
                    <Typography variant="body1">{getOriginalTextItem(name).text}</Typography>
                ))}
            </CommaSeparatedList>
        ),
        tokens: ({ tokens }: ITermViewModel) => (
            <CommaSeparatedList>
                {/* TODO one big reduce would be better here but I suppose the number of tokens is always small */}
                {tokens
                    .map(({ characters }) => characters.map(({ text }) => text).join('|'))
                    .join(' ')}
            </CommaSeparatedList>
        ),
    };

    return (
        <TermIndexTable
            type={AggregateType.term}
            headingLabels={headingLabels}
            tableData={(entities as ITermViewModel[]) || []}
            cellRenderersDefinition={cellRenderersDefinition}
            heading={'Terms'}
        />
    );
};
