import {
    EdgeConnectionMemberRole,
    EdgeConnectionType,
    IEdgeConnectionMember,
    INoteViewModel,
} from '@coscrad/api-interfaces';
import { HeadingLabel, IndexTable } from '../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { HasData } from '../higher-order-components';
import { renderAggregateIdCell } from '../resources/utils/render-aggregate-id-cell';

interface DisplayConnectedResourcesInfoProps {
    resourceInfos: IEdgeConnectionMember[];
}

const DisplayConnectedResourcesInfo = ({
    resourceInfos,
}: DisplayConnectedResourcesInfoProps): JSX.Element => {
    if (resourceInfos.length === 1) {
        const {
            compositeIdentifier: { type, id },
        } = resourceInfos[0];

        return (
            <div>
                A note about {type}/{id}
            </div>
        );
    }

    const {
        compositeIdentifier: { type: type0, id: id0 },
        role: role0,
    } = resourceInfos[0];

    const {
        compositeIdentifier: { type: type1, id: id1 },
    } = resourceInfos[1];

    const stringCompositeId0 = `${type0}/${id0}`;

    const stringCompositeId1 = `${type1}/${id1}`;

    const fromMessage =
        role0 === EdgeConnectionMemberRole.from
            ? `connection from ${stringCompositeId0} to ${stringCompositeId1}`
            : `connection from ${stringCompositeId1} to ${stringCompositeId0}`;

    return <div>{fromMessage}</div>;
};

export const NoteIndexPresenter = ({ data: notes }: HasData<INoteViewModel[]>): JSX.Element => {
    const headingLabels: HeadingLabel<INoteViewModel>[] = [
        {
            propertyKey: 'id',
            headingLabel: 'Link',
        },
        {
            propertyKey: 'note',
            headingLabel: 'Note',
        },
        {
            propertyKey: 'connectedResources',
            headingLabel: 'Connected Resources',
        },
        {
            propertyKey: 'connectionType',
            headingLabel: 'Connection Type',
        },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<INoteViewModel> = {
        id: renderAggregateIdCell,
        // we may want to limit or else wrap the note's text
        connectedResources: ({ connectedResources }: INoteViewModel) => (
            // do we want a simple icon for this instead?
            <DisplayConnectedResourcesInfo resourceInfos={connectedResources} />
        ),
        connectionType: ({ connectionType }: INoteViewModel) =>
            // icon?
            connectionType === EdgeConnectionType.self ? 'Single Resource Note' : 'Connecting Note',
    };

    return (
        <IndexTable
            headingLabels={headingLabels}
            tableData={notes}
            cellRenderersDefinition={cellRenderersDefinition}
            heading={'Notes'}
        />
    );
};
