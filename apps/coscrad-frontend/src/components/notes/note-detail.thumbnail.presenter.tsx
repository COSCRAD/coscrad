import { INoteViewModel } from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader } from '@mui/material';
import { findOriginalTextItem } from './shared/find-original-text-item';

export const NoteDetailThumbnailPresenter = ({ id, note }: INoteViewModel) => (
    <div data-testid={id}>
        <Card>
            <CardHeader title={'Note'}></CardHeader>
            <CardContent>{findOriginalTextItem(note).text}</CardContent>
        </Card>
    </div>
);
