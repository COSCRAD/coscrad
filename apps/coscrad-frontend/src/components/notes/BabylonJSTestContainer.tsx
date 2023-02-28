import { Vector3 } from '@babylonjs/core';
import {
    EdgeConnectionType,
    IDetailQueryResult,
    INoteViewModel,
    WithTags,
} from '@coscrad/api-interfaces';
import './babylonjs.css';
import { FullScreenContainer } from './FullScreenContainer';
import { getPointInSphere } from './getPointInSphere';
import { ConnectionByID, WebTest3dGUI } from './WebTest3dGUI';

export type ResourceNode = {
    id: string;
    title: string;
    connectionType: EdgeConnectionType;
    vectorCoords?: Vector3;
};

interface BabylonJSTestContainerProps {
    notes: IDetailQueryResult<WithTags<INoteViewModel>>[];
}

export const BabylonJSTestContainer = ({ notes }: BabylonJSTestContainerProps): JSX.Element => {
    const sphereSize: number = 5;

    const dualConnections = notes.filter((note) => note.connectionType == EdgeConnectionType.dual);

    const webNodes: ResourceNode[] = dualConnections.map(({ id, note, connectionType }) => {
        return {
            id: id,
            title: note.substring(0, 12),
            connectionType: connectionType,
            vectorCoords: getPointInSphere(sphereSize),
        };
    });

    const connectedResourcesById: ConnectionByID[] = dualConnections
        .map(({ connectedResources }) => connectedResources)
        .map((resourceConnection) => resourceConnection)
        .map(([to, from]) => {
            return [
                `${to.compositeIdentifier.type}/${to.compositeIdentifier.id}`,
                `${from.compositeIdentifier.type}/${from.compositeIdentifier.id}`,
            ];
        });

    return (
        <>
            <FullScreenContainer>
                <WebTest3dGUI nodes={webNodes} connectionsById={connectedResourcesById} />
            </FullScreenContainer>
        </>
    );
};
