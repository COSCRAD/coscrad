import { AggregateType, ITermViewModel, LanguageCode } from '@coscrad/api-interfaces';
import { AudioClipPlayer } from '@coscrad/media-player';
import { isNonEmptyString, isNullOrUndefined } from '@coscrad/validation-constraints';
import { LinkOff } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { useContext } from 'react';
import { useAppDispatch } from '../../../app/hooks';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { NOT_FOUND } from '../../../store/slices/interfaces/maybe-loadable.interface';
import { filterTerms } from '../../../store/slices/resources';
import { TermIndexState } from '../../../store/slices/resources/terms/types/term-index-state';
import { CommaSeparatedList } from '../../../utils/generic-components';
import {
    HeadingLabel,
    IndexSearchScope,
} from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { findOriginalTextItem } from '../../notes/shared/find-original-text-item';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { renderContributionsTextCell } from '../utils/render-contributions-text-cell';
import { renderMultilingualTextCell } from '../utils/render-multilingual-text-cell';
import { TermIndexTable } from './term-index-table';
import { TermSearchBar } from './term-search-bar';

export const TermIndexPresenter = (termsIndexResult: TermIndexState) => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const dispatch = useAppDispatch();

    const { entities: termsById } = termsIndexResult;

    const terms = Object.values(termsById).filter((t) => t !== NOT_FOUND);

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

    const onSearch = (scope: IndexSearchScope<ITermViewModel>, queryFromForm: string) => {
        if (!isNonEmptyString(queryFromForm)) {
            return; // TODO fetch with no filters
        }

        let condition;

        if (queryFromForm.charAt(0) === '{' && queryFromForm.includes('}')) {
            const extractedLanguageCode = queryFromForm.slice(1).split('}')[0];

            if (Object.values(LanguageCode).some((lc) => lc === extractedLanguageCode)) {
                condition = {
                    type: 'SIMPLE',
                    operator: 'MULTILINGUAL_TEXT_INCLUDES',
                    params: [queryFromForm, extractedLanguageCode],
                };
            }
        }

        // default
        if (!condition) {
            condition = {
                type: 'SIMPLE',
                operator: 'MULTILINGUAL_TEXT_INCLUDES',
                params: [queryFromForm],
            };
        }

        // const filter = {
        //     type: 'OR',
        //     conditions: (scope === ALL_PROPERTIES_SEARCH_KEY
        //         ? ['name', 'contributions', 'vocabularyLists', 'tokens']
        //         : [scope]
        //     ).map((field) => ({
        //         ...condition,
        //         field,
        //     })),
        // };

        // TODO type safety
        const action = filterTerms({ scope, query: queryFromForm });

        console.log({
            dispatching: action,
        });

        dispatch(
            // fetchTerms({
            //     filter: filter,
            //     pagination: {
            //         size: 100,
            //         page: 1,
            //     },
            // })
            action
        );
    };

    return (
        <Stack>
            {/* TODO Pull this from the resource info \ config? */}
            <Typography variant="h2">{'Terms'}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <TermSearchBar
                    onValueChange={(searchScope, newValue: string) => {
                        onSearch(searchScope, newValue);
                    }}
                    scopes={[
                        'name',
                        'contributions',
                        'vocabularyLists',
                        'tokens',
                        /**
                         * For some reason, `as const` leads to an incompatibility
                         * due to an incompatible `readonly` descriptor.
                         */
                    ]}
                />
            </Box>
            <Box>
                <TermIndexTable
                    type={AggregateType.term}
                    headingLabels={headingLabels}
                    tableData={terms as ITermViewModel[]}
                    cellRenderersDefinition={cellRenderersDefinition}
                    heading={'Terms'}
                />
            </Box>
        </Stack>
    );
};
