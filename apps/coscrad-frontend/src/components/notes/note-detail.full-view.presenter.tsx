import { AggregateType, INoteViewModel } from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader } from '@mui/material';
import { buildDataAttributeForAggregateDetailComponent } from '../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';
import { findOriginalTextItem } from './shared/find-original-text-item';

/**
 * TODO[https://www.pivotaltracker.com/story/show/183962233]
 *
 * Join in views of the (1 or 2) connected resources here. Otherwise,
 * the subject(s) of the note is unclear.
 */
export const NoteDetailFullViewPresenter = ({ id, note }: INoteViewModel) => (
    <div data-testid={buildDataAttributeForAggregateDetailComponent(AggregateType.note, id)}>
export const NoteDetailFullViewPresenter = ({ id, note }: INoteViewModel & ContextProps) => (
    <div data-testid={id}>
        <Card>
            <CardHeader title={'Note'}></CardHeader>
            <CardContent>{findOriginalTextItem(note).text}</CardContent>
        </Card>
    </div>
);
