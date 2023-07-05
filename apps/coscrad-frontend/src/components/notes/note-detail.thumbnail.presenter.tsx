import { INoteViewModel } from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader } from '@mui/material';
import { ContextProps } from '../resources/factories/full-view-categorizable-presenter-factory';
import { findOriginalTextItem } from './shared/find-original-text-item';

export const NoteDetailThumbnailPresenter = ({ id, note }: INoteViewModel & ContextProps) => (
    <div data-testid={id}>
        <Card>
            <CardHeader title={'Note'}></CardHeader>
            <CardContent>{findOriginalTextItem(note).text}</CardContent>
        </Card>
    </div>
);
