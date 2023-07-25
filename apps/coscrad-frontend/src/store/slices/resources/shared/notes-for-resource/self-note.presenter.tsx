import { AggregateType } from '@coscrad/api-interfaces';
import styled from '@emotion/styled';
import { TextSnippet as TextSnippetIcon } from '@mui/icons-material';
import { Box, Grid, Typography } from '@mui/material';
import { buildDataAttributeForAggregateDetailComponent } from '../../../../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';
import { SelfConnectionNote } from '../../../notes/hooks/use-loadable-self-notes-for-resource';

/**
 * TODO[https://www.pivotaltracker.com/story/show/185592121] augment the DefaultTheme
 */
const Item = styled(Box)(({ theme }) => ({
    padding: 0,
    marginBottom: '15px',
}));

export const SelfNotePresenter = ({ text, id, context }: SelfConnectionNote): JSX.Element => (
    <Item data-testid={buildDataAttributeForAggregateDetailComponent(AggregateType.note, id)}>
        <Grid container wrap="nowrap" spacing={0} columns={2}>
            <Grid item sx={{ pr: 2 }}>
                <TextSnippetIcon />
            </Grid>
            <Grid item>
                {/* TODO Use property presenter helper after rebasing */}
                <Typography variant="h5">Note ({id}):</Typography>
                <Typography paragraph>{text}</Typography>
                {/* TODO Eventually we should offer a way to highlight this context in the detail view */}
                {/* We may not need to present this here in this way. This is for development only. */}
                <Typography variant="h6">Context</Typography>
                <Typography paragraph>{JSON.stringify(context)}</Typography>
            </Grid>
        </Grid>
    </Item>
);
