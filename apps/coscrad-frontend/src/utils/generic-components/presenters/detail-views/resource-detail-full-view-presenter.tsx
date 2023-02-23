import { IMultilingualText } from '@coscrad/api-interfaces';
import { Card, CardContent } from '@mui/material';
import { ReactNode } from 'react';
import { MultilingualTextPresenter } from '../multilingual-text-presenter';

export interface ResourceDetailFullViewPresenterProps {
    id: string;
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
    name: IMultilingualText;
    children: ReactNode;
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
    children,
}: ResourceDetailFullViewPresenterProps): JSX.Element => (
    <div data-testid={id}>
        <Card>
            <MultilingualTextPresenter text={name} />
            {/* <CardMedia>
            // We need to conditionally render media if they are specified
            // Note that you are not supposed to have a CardMedia section with no children
            {isNonEmptyString(audioUrl) ? <MediaPlayer audioUrl={audioUrl} /> : null}
        </CardMedia> */}
            <CardContent>{children}</CardContent>
        </Card>
    </div>
);
