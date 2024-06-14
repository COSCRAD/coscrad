import { ContributorWithId, IMultilingualText, ResourceType } from '@coscrad/api-interfaces';
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

const ContributionsPresenter = ({
    contributions,
}: {
    contributions: ContributorWithId[];
}): JSX.Element => (
    <List>
        {contributions.map((contribution) => (
            <ListItem
                disableGutters
                style={{ borderBottom: '1px solid #ccc' }}
                key={`${contribution.fullName}-${contribution.id}`}
                data-testid={`${contribution.id}`}
            >
                <ContributionPresenter contributor={contribution} />
                <Divider />
            </ListItem>
        ))}
    </List>
);

interface ContributionPresenterProps {
    contributor: ContributorWithId;
}

const ContributionPresenter = ({ contributor: { fullName } }: ContributionPresenterProps) => {
    return (
        <>
            <ListItemIcon>
                <Person color="secondary" />
            </ListItemIcon>
            <Typography variant="body1">{fullName}</Typography>
        </>
    );
};

export interface ResourceDetailFullViewPresenterProps {
    id: string;
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
    contributions: ContributorWithId[];
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
                {contributions.length > 0 ? (
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
                ) : null}
            </Grid>
        </Grid>
    );
};
