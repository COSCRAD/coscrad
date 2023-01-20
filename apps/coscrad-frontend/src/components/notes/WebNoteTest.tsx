import { EdgeConnectionType } from '@coscrad/api-interfaces';
import { NoteIndexState } from '../../store/slices/notes/types/note-index-state';
import { SinglePropertyPresenter } from '../../utils/generic-components';

export const WebNoteTest = ({ entities: notes }: NoteIndexState): JSX.Element => {
    const isDual = (type) => (type === EdgeConnectionType.dual ? true : false);

    const connectedResources = notes
        .filter(({ connectionType }) => isDual(connectionType))
        .map((note, index) => note.connectedResources);

    return (
        <>
            <h1>Note Test</h1>
            {connectedResources.map((connection, index) =>
                connection.map((resource) => (
                    <div>
                        <SinglePropertyPresenter
                            display="ID"
                            value={resource.compositeIdentifier.id}
                        />
                        <SinglePropertyPresenter
                            display="Type"
                            value={resource.compositeIdentifier.type}
                        />
                        <SinglePropertyPresenter display="Connection Role" value={resource.role} />
                    </div>
                ))
            )}
        </>
    );
};
