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

export const ResourceDetailThumbnailPresenter = ({
    name,
    audioUrl,
    children,
}: ResourceDetailThumbnailPresenterProps): JSX.Element => (
    <Card>
        <CardHeader>
            <MultilingualTextPresenter text={name} />
        </CardHeader>
        {/* <CardMedia>
            {isNonEmptyString(audioUrl) ? <MediaPlayer audioUrl={audioUrl} /> : null}
        </CardMedia> */}
        <CardContent>{children}</CardContent>
    </Card>
);
