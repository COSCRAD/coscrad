import { IMultilingualText } from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader } from '@mui/material';
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

export const ResourceDetailFullViewPresenter = ({
    id,
    name,
    audioUrl,
    children,
}: ResourceDetailFullViewPresenterProps): JSX.Element => (
    <div data-testid={id}>
        <Card>
            <CardHeader>
                <MultilingualTextPresenter text={name} />
            </CardHeader>
            {/* <CardMedia>
            {isNonEmptyString(audioUrl) ? <MediaPlayer audioUrl={audioUrl} /> : null}
        </CardMedia> */}
            <CardContent>{children}</CardContent>
        </Card>
    </div>
);
