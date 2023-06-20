import { ResourceType } from '@coscrad/api-interfaces';
import { useAppDispatch } from '../../../app/hooks';
import { executeCommand } from '../../../store/slices/command-status';
import { useLoadableGeneratedId } from '../../../store/slices/id-generation';
import { displayLoadableWithErrorsAndLoading } from '../../higher-order-components';
import { CreateNoteForm } from './create-note-form';

export interface CreateNotePanelProps {
    resourceCompositeIdentifier: {
        type: ResourceType;
        id: string;
    };
}

type HasId = {
    id: string;
};

export const CreateNotePanel = ({
    resourceCompositeIdentifier,
}: CreateNotePanelProps): JSX.Element => {
    const dispatch = useAppDispatch();

    const loadableGeneratedId = useLoadableGeneratedId();

    const Form = ({ id }: HasId) => (
        <CreateNoteForm
            onSubmit={(formState) => {
                const commandFsa = {
                    ...formState,
                    resourceCompositeIdentifier,
                    resourceContext: {
                        type: 'general',
                    },
                    aggregateCompositeIdentifier: {
                        id,
                        type: 'note',
                    },
                };

                console.log({
                    dispatchingFsa: commandFsa,
                });

                dispatch(
                    executeCommand({
                        type: `CREATE_NOTE_ABOUT_RESOURCE`,
                        payload: commandFsa,
                    })
                );
            }}
        />
    );

    const FormWithLoadingAndErrorHandling = displayLoadableWithErrorsAndLoading<string, HasId>(
        Form,
        (generatedId) => ({ id: generatedId })
    );

    return <FormWithLoadingAndErrorHandling {...loadableGeneratedId} />;
};
