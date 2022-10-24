import { INoteViewModel } from '@coscrad/api-interfaces';
import { Link } from 'react-router-dom';

type HasNotes = {
    notes: INoteViewModel[];
};

export const NoteIndexPresenter = ({ notes }: HasNotes): JSX.Element => (
    <div>
        {notes.map((note) => (
            <div key={note.id} data-testid={note.id}>
                <h1>
                    note: <Link to={`/Notes/${note.id}`}>{note.id}</Link>
                </h1>
                <p>{note.note}</p>
                <h2>Full Props (stringified):</h2>
                <p>{JSON.stringify(note)}</p>
            </div>
        ))}
    </div>
);
