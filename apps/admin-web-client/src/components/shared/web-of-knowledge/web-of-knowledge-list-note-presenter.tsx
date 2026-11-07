import { IConnectionMembers, IMultilingualText, ResourceType } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, Grid, Stack, Typography } from '@mui/material';
import { thumbnailCategorizableDetailPresenterFactory } from '../../resources/factories/thumbnail-categorizable-detail-presenter-factory';
import { findOriginalMultilingualTextItem } from '../../resources/terms/term-list.container';

interface WebOfKnowledgeListNotePresenterProps {
    noteText: IMultilingualText;
    connectedResources: IConnectionMembers;
}

export const WebOfKnowledgeListNotePresenter = ({
    noteText,
    connectedResources,
}: WebOfKnowledgeListNotePresenterProps): JSX.Element => {
    const originalNoteItem = findOriginalMultilingualTextItem(noteText);

    const { resource: fromResource } = connectedResources.from;

    const { resource: toResource } = connectedResources.to;

    const FromThumbnailDetailPresenter = !isNullOrUndefined(fromResource)
        ? thumbnailCategorizableDetailPresenterFactory(fromResource.type as ResourceType)
        : null;

    const ToThumbnailDetailPresenter = !isNullOrUndefined(toResource)
        ? thumbnailCategorizableDetailPresenterFactory(toResource.type as ResourceType)
        : null;

    return (
        <Stack>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4">Note: "{originalNoteItem.text}"</Typography>
                <Grid container>
                    <Grid item>
                        <FromThumbnailDetailPresenter
                            id={fromResource.id}
                            shouldDisplayActionButtons={false}
                        />
                    </Grid>
                    <Grid item>
                        <ToThumbnailDetailPresenter
                            id={fromResource.id}
                            shouldDisplayActionButtons={false}
                        />
                    </Grid>
                </Grid>
            </Box>
        </Stack>
    );
};
