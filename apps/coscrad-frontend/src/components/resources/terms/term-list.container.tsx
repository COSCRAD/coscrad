import { AggregateType, CategorizableType, ITermViewModel } from '@coscrad/api-interfaces';
import { AudioClipPlayer } from '@coscrad/media-player';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { LinkOff } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { useLoadableTerms } from '../../../store/slices/resources';
import { CommaSeparatedList } from '../../../utils/generic-components';
import { HeadingLabel } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { ErrorDisplay } from '../../error-display/error-display';
import { Loading } from '../../loading';
import { findOriginalTextItem } from '../../notes/shared/find-original-text-item';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { renderContributionsTextCell } from '../utils/render-contributions-text-cell';
import { renderMultilingualTextCell } from '../utils/render-multilingual-text-cell';
import { TermIndexTable } from './term-index-table';

export const TermListContainer = (): JSX.Element => {
    const { defaultLanguageCode, indexToDetailFlows } = useContext(ConfigurableContentContext);

    const headingForList =
        indexToDetailFlows.find(
            ({ categorizableType }) => categorizableType === CategorizableType.term
        )?.labelOverrides?.pluralLabel || 'Terms';

    // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-332] we need to deal with pagination here
    const loadableTerms = useLoadableTerms();

    const { errorInfo, isLoading, data } = loadableTerms;

    if (errorInfo) {
        return <ErrorDisplay {...errorInfo}></ErrorDisplay>;
    }

    if (isLoading || isNullOrUndefined(data)) return <Loading />;

    const { selected: terms } = data;

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

    return (
        <TermIndexTable
            type={AggregateType.term}
            headingLabels={headingLabels}
            tableData={(terms as ITermViewModel[]) || []}
            cellRenderersDefinition={cellRenderersDefinition}
            heading={headingForList}
        />
    );
};
