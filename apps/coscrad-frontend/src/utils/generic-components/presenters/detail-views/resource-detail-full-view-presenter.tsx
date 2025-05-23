import { IContributionSummary, IMultilingualText, ResourceType } from '@coscrad/api-interfaces';
import { Box, Grid } from '@mui/material';
import { ReactNode } from 'react';
import { buildDataAttributeForAggregateDetailComponent } from './build-data-attribute-for-aggregate-detail-component';
import { ContributionsPresenter } from './contributions-presenter';
import {
    ResourceDetailPresenterHeader,
    ResourceNamePresenter,
} from './resource-detail-presenter-header';
import { ResourcePreviewIconFactory } from './resource-preview-icon';

export interface ResourceDetailFullViewPresenterProps {
    id: string;
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
    contributions: IContributionSummary[];
    name: IMultilingualText;
    type: ResourceType;
    children?: ReactNode;
    NamePresenter?: ResourceNamePresenter;
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
    NamePresenter,
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
                <ResourceDetailPresenterHeader
                    id={id}
                    type={type}
                    name={name}
                    variant="h3"
                    NamePresenter={NamePresenter}
                />

                <div data-testid={buildDataAttributeForAggregateDetailComponent(type, id)} />
                {children}
                {contributions.length > 0 ? (
                    <Box ml={1}>
                        <ContributionsPresenter
                            contributions={contributions}
                            data-testid="resource-contributions"
                        />
                    </Box>
                ) : null}
            </Grid>
        </Grid>
    );
};
