import { INoteViewModel } from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader } from '@mui/material';

export const NoteDetailThumbnailPresenter = ({ id, note: text }: INoteViewModel) => (
    <div data-testid={id}>
        <Card>
            <CardHeader title={'Note'}></CardHeader>
            <CardContent>{text}</CardContent>
        </Card>
    </div>
);
