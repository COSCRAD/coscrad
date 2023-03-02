import { IMultilingualText, ResourceType } from '@coscrad/api-interfaces';
import { Card, CardContent } from '@mui/material';
import { routes } from 'apps/coscrad-frontend/src/app/routes/routes';
import { ResourceNavLink } from 'apps/coscrad-frontend/src/components/resources/shared/resource-nav-link';
import { ReactNode } from 'react';
import { FloatSpacerDiv } from '../../float-spacer';
import { MultilingualTextPresenter } from '../multilingual-text-presenter';
import { ResourcePreviewImage } from './resource-preview-image';

export interface ResourceDetailThumbnailPresenterProps {
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
    id: string;
    type: ResourceType;
    name: IMultilingualText;
    src: string;
    children: ReactNode;
}

/**
 * This generic component is meant to serve as a single-source of truth for
 * the look and feel of a Resource's thumbnail detail view. We adapt the
 * view models \ data to this API in the specific thumbnail detail views for
 * each resource.
 *
 * This is WIP. We will solidify the API as we make our first pass of the resources.
 */
export const ResourceDetailThumbnailPresenter = ({
    id,
    type,
    name,
    src,
    children,
}: ResourceDetailThumbnailPresenterProps): JSX.Element => (
    <Card>
        <CardContent>
            <ResourcePreviewImage src={src} />
            <MultilingualTextPresenter text={name} />
            {children}
            <ResourceNavLink linkURL={`/${routes.resources.ofType(type).detail(id)}`} />
            <FloatSpacerDiv />
        </CardContent>
    </Card>
);
