import { Box, Stack, Typography } from '@mui/material';

import { ITermViewModel } from '@coscrad/api-interfaces';
import { useState } from 'react';
import { HeadingLabel } from '../../tables';
import { IUserQueryOptions } from './store';
import { TermListContainer } from './term-list.container';
import { DEFAULT_PAGE_SIZE, TermPaginator } from './term-paginator';

// TODO share this with the `HeadingLabels`
const searchableProps: HeadingLabel<ITermViewModel>[] = [
    { propertyKey: 'name', headingLabel: 'Term' },
    { propertyKey: 'contributions', headingLabel: 'Contributors' },
    { propertyKey: 'vocabularyLists', headingLabel: 'Vocabulary Lists' },
    { propertyKey: 'tokens', headingLabel: 'Letters' },
];

export const TermIndexPage = (): JSX.Element => {
    const [paginationOptions, setPaginationOptions] = useState<IUserQueryOptions>({
        pagination: {
            size: DEFAULT_PAGE_SIZE,
            page: 1,
        },
    });

    return (
        <div>
            <Stack>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Typography variant="h4">Search Bar Goes Here</Typography>
                    {/* <TermSearchBar scopes={searchableProps} /> */}
                </Box>
                <Box>
                    <TermListContainer paginationOptions={paginationOptions} />
                </Box>
                <Box>
                    <TermPaginator
                        paginationOptions={paginationOptions}
                        setPaginationOptions={setPaginationOptions}
                    />
                </Box>
            </Stack>
        </div>
    );
};
