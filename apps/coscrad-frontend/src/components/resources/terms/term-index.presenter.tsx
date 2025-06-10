import {
    AggregateType,
    ITermViewModel,
    IVocabularyListRecordForTerm,
} from '@coscrad/api-interfaces';
import { AudioClipPlayer } from '@coscrad/media-player';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { LinkOff } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { TermIndexState } from '../../../store/slices/resources/terms/types/term-index-state';
import { CommaSeparatedList } from '../../../utils/generic-components';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import {
    doesTextIncludeCaseInsensitive,
    Matchers,
} from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/filter-table-data';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { findOriginalTextItem } from '../../notes/shared/find-original-text-item';
import { doesSomeMultilingualTextItemInclude } from '../utils/query-matchers';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { renderContributionsTextCell } from '../utils/render-contributions-text-cell';
import { renderMultilingualTextCell } from '../utils/render-multilingual-text-cell';

export const TermIndexPresenter = (termsIndexResult: TermIndexState) => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const { entities: terms } = termsIndexResult;

    const headingLabels: HeadingLabel<ITermViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'Link' },
        // TODO We need to determine the `term` and `termEnglish` from a multilingual text property
        { propertyKey: 'name', headingLabel: 'Term' },
        { propertyKey: 'audioURL', headingLabel: 'Audio URL' },
        { propertyKey: 'contributions', headingLabel: 'Contributors' },
        { propertyKey: 'vocabularyLists', headingLabel: 'Vocabulary Lists' },
        { propertyKey: 'tokens', headingLabel: 'Letters' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<ITermViewModel> = {
        id: renderAggregateIdCell,
        // TODO We need to determine the `term` and `termEnglish` from a multilingual text property
        name: ({ name }: ITermViewModel) => renderMultilingualTextCell(name, defaultLanguageCode),
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
                    <Typography variant="body1">{findOriginalTextItem(name).text}</Typography>
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

    const matchers: Matchers<ITermViewModel> = {
        name: doesSomeMultilingualTextItemInclude,
        vocabularyLists: (vocabularyLists: IVocabularyListRecordForTerm[], searchTerm: string) =>
            vocabularyLists.some(({ name }) =>
                name.items.some(({ text }) => doesTextIncludeCaseInsensitive(text, searchTerm))
            ),
        tokens: (tokens, searchTerm) =>
            (tokens || []).some(({ characters }) =>
                characters.some((c) => !c.isOutOfAlphabet && c.text === searchTerm.toLowerCase())
            ),
    };

    return (
        <IndexTable
            type={AggregateType.term}
            headingLabels={headingLabels}
            tableData={terms}
            cellRenderersDefinition={cellRenderersDefinition}
            heading={'Terms'}
            filterableProperties={['name', 'contributions', 'vocabularyLists', 'tokens']}
            matchers={matchers}
        />
    );
};
