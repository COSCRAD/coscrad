import { Box, Stack } from '@mui/material';

import { TermPaginator } from './src/components/resources/terms/term-paginator';
import { TermSearchBar } from './src/components/resources/terms/term-search-bar';
import { TermListContainer } from './term-list.container';

export const TermIndexPage = (): JSX.Element => {
    return (
        <div>
            <Stack>
                {/* <Typography variant="h2">{label}</Typography> */}
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <TermSearchBar
                        scopes={['name', 'contributions', 'vocabularyLists', 'tokens']}
                    />
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
