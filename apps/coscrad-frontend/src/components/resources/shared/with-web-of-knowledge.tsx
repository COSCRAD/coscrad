import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { ConnectedResources } from '../../../store/slices/resources/shared/connected-resources';
import { SelfNotesContainer } from '../../../store/slices/resources/shared/notes-for-resource';
import { FunctionalComponent } from '../../../utils/types/functional-component';

type HasCompositeIdentifier = {
    compositeIdentifier: ResourceCompositeIdentifier;
};

export const WithWebOfKnowledge =
    <TProps extends HasCompositeIdentifier>(WrappedComponent: FunctionalComponent<TProps>) =>
    (props: TProps) => {
        const { compositeIdentifier } = props;

        return (
            <div>
                {WrappedComponent(props)}
                <ConnectedResources compositeIdentifier={compositeIdentifier} />
                <SelfNotesContainer compositeIdentifier={compositeIdentifier} />
            </div>
        );
    };
