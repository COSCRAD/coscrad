import { IMultilingualText } from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader } from '@mui/material';
import { ReactNode } from 'react';
import { MultilingualTextPresenter } from '../multilingual-text-presenter';

export interface ResourceDetailThumbnailPresenterProps {
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
    name: IMultilingualText;
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
    name,
    children,
}: ResourceDetailThumbnailPresenterProps): JSX.Element => (
    <Card>
        <CardHeader>
            <MultilingualTextPresenter text={name} />
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);
