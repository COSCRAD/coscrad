import { IMultilingualText, ResourceType } from '@coscrad/api-interfaces';
import { isNullOrUndefined, isString } from '@coscrad/validation-constraints';
import { Grid, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { CoscradMainContentContainer } from '../../style-components/coscrad-main-content-container';
import { MultilingualTextPresenter } from '../multilingual-text-presenter';
import { SinglePropertyPresenter } from '../single-property-presenter';
import { ResourcePreviewIconFactory } from './resource-preview-icon';

export interface ResourceDetailFullViewPresenterProps {
    id: string;
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
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
}: ResourceDetailFullViewPresenterProps): JSX.Element => (
    <CoscradMainContentContainer>
        <Grid container spacing={0} columns={{ xs: 2, sm: 4, md: 12 }}>
            <Grid item xs={2} sm={1} md={2}>
                {/* Temporary.  We'd like an icon if there's no visual media associated with this resource */}
                {type !== ResourceType.photograph && (
                    <ResourcePreviewIconFactory resourceType={type} size="lg" />
                )}
            </Grid>
            <Grid item xs={2} sm={2} md={8}>
                {/* TODO: consider putting a standardized name property on the view models */}
                <Typography gutterBottom variant="h6" fontWeight="bold" color="primary">
                    {isString(name) || isNullOrUndefined(name) ? (
                        name
                    ) : (
                        <MultilingualTextPresenter text={name} />
                    )}
                </Typography>
                <SinglePropertyPresenter display="ID" value={id} />
                {children}
            </Grid>
        </Grid>
    </CoscradMainContentContainer>
);
