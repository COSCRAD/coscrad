import { Box, Stack } from '@mui/material';

import { ITermViewModel } from '@coscrad/api-interfaces';
import { HeadingLabel } from '../../../utils/generic-components/presenters/tables';
import { TermListContainer } from './term-list.container';
import { TermPaginator } from './term-paginator';
import { TermSearchBar } from './term-search-bar';

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
