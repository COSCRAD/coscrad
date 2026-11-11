import { EdgeConnectionType } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { FormControlLabel, FormGroup, Stack, Switch, Tooltip, Typography } from '@mui/material';
import { useState } from 'react';
import { PageContentLayout } from '../page-content-layout';
import { WebOfKnowledgeListNotePresenter } from './web-of-knowledge-list-note-presenter';
import { WebOfKnowledgeVisual } from './web-of-knowledge-visual';
import { useFetchConnectionsQuery } from './web-of-knowledge.api';

export const WebOfKnowledge = (): JSX.Element => {
    const [showVisualWeb, setShowVisualWeb] = useState<boolean>(true);

    const { data, isLoading, isError } = useFetchConnectionsQuery();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) return <div>Error retrieving connections.</div>;

    const webOfKnowledgeNotes = data?.entities.filter(
        ({ connectionType }) => connectionType === EdgeConnectionType.dual
    );

    const toggleVisual = (event: React.ChangeEvent<HTMLInputElement>) => {
        setShowVisualWeb(event.target.checked);
    };

    return (
        <PageContentLayout>
            <Typography variant="h2">Web of Knowledge</Typography>
            <Tooltip title="Toggle Visual View">
                <FormGroup>
                    <FormControlLabel
                        control={<Switch checked={showVisualWeb} onChange={toggleVisual} />}
                        label="Visual View Toggle"
                    />
                </FormGroup>
            </Tooltip>
            {showVisualWeb ? (
                <WebOfKnowledgeVisual connections={webOfKnowledgeNotes} />
            ) : (
                <Stack>
                    {!isNullOrUndefined(webOfKnowledgeNotes) ? (
                        <Stack>
                            {webOfKnowledgeNotes.map(({ text, connectedResources }, index) => (
                                <WebOfKnowledgeListNotePresenter
                                    key={`${index}-${connectedResources.from.resource.id}`}
                                    noteText={text}
                                    connectedResources={connectedResources}
                                />
                            ))}
                        </Stack>
                    ) : null}
                </Stack>
            )}
        </PageContentLayout>
    );
};
