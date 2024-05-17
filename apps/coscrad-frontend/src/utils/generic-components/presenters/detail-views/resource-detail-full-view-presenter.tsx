import { IMultilingualText, ResourceType } from '@coscrad/api-interfaces';
import { ListRounded, Person } from '@mui/icons-material';
import {
    Box,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    Paper,
    Typography,
} from '@mui/material';
import { ReactNode } from 'react';
import { buildDataAttributeForAggregateDetailComponent } from './build-data-attribute-for-aggregate-detail-component';
import { ResourceDetailPresenterHeader } from './resource-detail-presenter-header';
import { ResourcePreviewIconFactory } from './resource-preview-icon';

interface ContributionPresenterProps {
    contributor: string;
}

const ContributionsPresenter = ({ contributions }: { contributions: string[] }): JSX.Element => (
    <>
        {contributions.map((contributor, index) => (
            // be sure that the same contributor rcan't come through twice
            <Box>
                <ContributionPresenter contributor={contributor} key={contributor + index} />
                <Divider />
            </Box>
        ))}
    </>
);

const ContributionPresenter = ({ contributor }: ContributionPresenterProps) => {
    return (
        <List>
            <ListItem disableGutters disablePadding>
                <ListItemIcon>
                    <Person color="secondary" />
                </ListItemIcon>
                <Typography variant="body1">{contributor}</Typography>
            </ListItem>
        </List>
    );
};

export interface ResourceDetailFullViewPresenterProps {
    id: string;
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
    contributions: string[];
    // TODO: Refactor the name property to eliminate this conditional type
    name: IMultilingualText | string;
    type: ResourceType;
    children?: ReactNode;
}

/**
 * This generic component is meant to serve as a single-source of truth for
 * the look and feel of a Resource's full detail view. We adapt the
 * view models \ data to this API in the specific full detail views for
 * each resource.
 *
 * This is WIP. We will solidify the API as we make our first pass of the resources.
 */
export const ResourceDetailFullViewPresenter = ({
    id,
    name,
    type,
    children,
    contributions,
}: ResourceDetailFullViewPresenterProps): JSX.Element => {
    return (
        <Grid container spacing={0} columns={{ xs: 2, sm: 4, md: 12 }}>
            <Grid item xs={2} sm={1} md={2}>
                {/* Temporary.  We'd like an icon if there's no visual media associated with this resource */}
                {type !== ResourceType.photograph && (
                    <ResourcePreviewIconFactory resourceType={type} size="lg" />
                )}
            </Grid>
            <Grid item xs={2} sm={2} md={8}>
                {/* TODO: consider putting a standardized name property on the view models */}
                <ResourceDetailPresenterHeader id={id} type={type} name={name} variant="h3" />

                <div data-testid={buildDataAttributeForAggregateDetailComponent(type, id)} />
                {children}
                <Box>
                    <Box elevation={0} component={Paper}>
                        <IconButton>
                            <ListRounded />
                        </IconButton>
                        Contributions
                    </Box>

                    <Box ml={1}>
                        <ContributionsPresenter contributions={contributions} />
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
};
