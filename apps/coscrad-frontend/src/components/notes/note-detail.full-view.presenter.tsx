import { INoteViewModel } from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader } from '@mui/material';

/**
 * TODO[https://www.pivotaltracker.com/story/show/183962233]
 *
 * Join in views of the (1 or 2) connected resources here. Otherwise, it's
 * the subject(s) of the note is unclear.
 */
export const NoteDetailFullViewPresenter = ({ id, note: text }: INoteViewModel) => (
    <div data-testid={id}>
        <Card>
            <CardHeader title={'Note'}></CardHeader>
            <CardContent>{text}</CardContent>
        </Card>
    </div>
);
