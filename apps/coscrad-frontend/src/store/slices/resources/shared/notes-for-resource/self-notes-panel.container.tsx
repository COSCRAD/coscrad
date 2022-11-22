import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { displayLoadableWithErrorsAndLoading } from '../../../../../components/higher-order-components';
import {
    SelfConnectionNote,
    useLoadableSelfNotesForResource,
} from '../../../notes/hooks/use-loadable-self-notes-for-resource';
import { SelfNotesPanelPresenter } from './self-notes-panel.presenter';

interface SelfNotesPanelContainerProps {
    compositeIdentifier: ResourceCompositeIdentifier;
}

export const SelfNotesPanelContainer = ({
    compositeIdentifier,
}: SelfNotesPanelContainerProps): JSX.Element => {
    const loadableSelfNotes = useLoadableSelfNotesForResource(compositeIdentifier);

    const Presenter = displayLoadableWithErrorsAndLoading(
        SelfNotesPanelPresenter,
        (notes: SelfConnectionNote[]) => ({
            notes,
            compositeIdentifier,
        })
    );

    return <Presenter {...loadableSelfNotes} />;
};
