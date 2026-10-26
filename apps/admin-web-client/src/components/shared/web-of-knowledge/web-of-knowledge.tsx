import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, Stack, Typography } from '@mui/material';
import { findOriginalMultilingualTextItem } from '../../resources/terms/term-list.container';
import { PageContentLayout } from '../page-content-layout';
import { useFetchConnectionsQuery } from './web-of-knowledge.api';

export const WebOfKnowledge = (): JSX.Element => {
    const { data, isLoading, isError } = useFetchConnectionsQuery();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) return <div>Error retrieving connections.</div>;

    const webOfKnowledgeNotes = data?.entities;

    console.log({ webOfKnowledgeNotes });

    return (
        <PageContentLayout>
            <Typography variant="h2">Web of Knowledge</Typography>
            <Stack>
                {!isNullOrUndefined(webOfKnowledgeNotes) ? (
                    <Stack>
                        {webOfKnowledgeNotes.map(({ text, connectedResources }) => {
                            const originalNoteItem = findOriginalMultilingualTextItem(text);

                            const fromConnection = connectedResources.from;

                            const toConnection = connectedResources.to;

                            return (
                                <Stack>
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="h4">
                                            {originalNoteItem.text}
                                        </Typography>
                                        <Typography variant="body1">
                                            <Typography component="span" variant="h5">
                                                {fromConnection.resource.type}/
                                                {fromConnection.resource.id}
                                            </Typography>{' '}
                                            is connected to{' '}
                                            <Typography component="span" variant="h5">
                                                {toConnection.resource.type}/
                                                {toConnection.resource.id}
                                            </Typography>
                                        </Typography>
                                    </Box>
                                </Stack>
                            );
                        })}
                    </Stack>
                ) : null}
            </Stack>
        </PageContentLayout>
    );
};
