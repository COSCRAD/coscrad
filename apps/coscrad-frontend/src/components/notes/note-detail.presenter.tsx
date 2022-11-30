import { INoteViewModel } from '@coscrad/api-interfaces';

export const NoteDetailPresenter = ({ id, note: text }: INoteViewModel) => (
    <div>
        <h2>Note ({id})</h2>
        <p>{text}</p>
    </div>
);
