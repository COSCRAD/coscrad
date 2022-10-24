import { INoteViewModel } from '@coscrad/api-interfaces';

export const NoteDetailPresenter = ({ id, note: text, relatedResources }: INoteViewModel) => (
    <div>
        <h2>Note ({id})</h2>
        <p>{text}</p>

        <h2>Connected Resources</h2>
        <p>
            {relatedResources.map((resource, index) => (
                <div>
                    [{index}]: {JSON.stringify(resource)}
                </div>
            ))}
        </p>
    </div>
);
