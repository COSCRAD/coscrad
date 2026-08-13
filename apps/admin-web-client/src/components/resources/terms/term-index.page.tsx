import { Box, Stack } from '@mui/material';

import { ITermViewModel } from '@coscrad/api-interfaces';
import { HeadingLabel } from '../../shared/tables';
import { TermSearchBar } from '../../shared/tables/term-search-bar';
import { TermListContainer } from './term-list.container';
import { TermPaginator } from './term-paginator';

// TODO share this with the `HeadingLabels`
const searchableProps: HeadingLabel<ITermViewModel>[] = [
    { propertyKey: 'name', headingLabel: 'Term' },
    { propertyKey: 'contributions', headingLabel: 'Contributors' },
    { propertyKey: 'vocabularyLists', headingLabel: 'Vocabulary Lists' },
    { propertyKey: 'tokens', headingLabel: 'Letters' },
];

export const TermIndexPage = (): JSX.Element => {
    return (
        <div>
            <Stack>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <TermSearchBar scopes={searchableProps} />
                </Box>
                <Box>
                    <TermListContainer />
                </Box>
                <Box>
                    <TermPaginator />
                </Box>
            </Stack>
        </div>
    );
};
