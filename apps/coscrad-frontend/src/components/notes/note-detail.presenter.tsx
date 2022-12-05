import { INoteViewModel } from '@coscrad/api-interfaces';

/**
 * TODO[https://www.pivotaltracker.com/story/show/183962233]
 *
 * Join in views of the (1 or 2) connected resources here. Otherwise, it's
 * the subject(s) of the note is unclear.
 */
export const NoteDetailPresenter = ({ id, note: text }: INoteViewModel) => (
    <div>
        <h2>Note ({id})</h2>
        <p>{text}</p>
    </div>
);
