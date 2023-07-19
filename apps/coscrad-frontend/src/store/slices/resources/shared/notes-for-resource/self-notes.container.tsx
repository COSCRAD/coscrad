import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { displayLoadableWithErrorsAndLoading } from '../../../../../components/higher-order-components';
import {
    SelfConnectionNote,
    useLoadableSelfNotesForResource,
} from '../../../notes/hooks/use-loadable-self-notes-for-resource';
import { SelfNotesPresenter } from './self-notes.presenter';

interface SelfNotesContainerProps {
    compositeIdentifier: ResourceCompositeIdentifier;
}

export const SelfNotesContainer = ({
    compositeIdentifier,
}: SelfNotesContainerProps): JSX.Element => {
    const loadableSelfNotes = useLoadableSelfNotesForResource(compositeIdentifier);

    const Presenter = displayLoadableWithErrorsAndLoading(
        SelfNotesPresenter,
        (notes: SelfConnectionNote[]) => ({
            notes,
            compositeIdentifier,
        })
    );

    return <Presenter {...loadableSelfNotes} />;
};
