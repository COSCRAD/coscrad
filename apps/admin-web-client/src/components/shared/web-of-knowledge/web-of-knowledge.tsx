import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Stack, Typography } from '@mui/material';
import { PageContentLayout } from '../page-content-layout';
import { WebOfKnowledgeListNotePresenter } from './web-of-knowledge-list-note-presenter';
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
                        {webOfKnowledgeNotes.map(({ text, connectedResources }) => 
                            <WebOfKnowledgeListNotePresenter noteText={text} connectedResources={connectedResources} />
                        )}
                    </Stack>
                ) : null}
            </Stack>
        </PageContentLayout>
    );
};
