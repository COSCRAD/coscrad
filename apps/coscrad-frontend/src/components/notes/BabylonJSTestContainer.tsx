import { Vector3 } from '@babylonjs/core';
import {
    EdgeConnectionType,
    IDetailQueryResult,
    INoteViewModel,
    WithTags,
} from '@coscrad/api-interfaces';
import './babylonjs.css';
import { FullScreenContainer } from './FullScreenContainer';
import { getNodeCoordinates } from './getNodeCoordinates';
import { getPointInSphere } from './getPointInSphere';
import { WebTest3dGUI } from './WebTest3dGUI';

export type ResourceNode = {
    nodeId: string;
    title: string;
    vectorCoords?: Vector3;
};

export type NoteEdge = {
    toCoords: Vector3;
    fromCoords: Vector3;
    note: string;
};

interface BabylonJSTestContainerProps {
    notes: IDetailQueryResult<WithTags<INoteViewModel>>[];
}

export const BabylonJSTestContainer = ({ notes }: BabylonJSTestContainerProps): JSX.Element => {
    const sphereSize: number = 6;

    const dualConnections = notes.filter((note) => note.connectionType == EdgeConnectionType.dual);

    let resourceNodes: ResourceNode[] = dualConnections
        .map(({ connectedResources }) => connectedResources)
        .map((resourceConnection) => resourceConnection)
        .reduce((acc, currentValue) => acc.concat(currentValue), [])
        .map((resource) => {
            return {
                nodeId: `${resource.compositeIdentifier.type}/${resource.compositeIdentifier.id}`,
                title: `${
                    resource.compositeIdentifier.type.charAt(0).toUpperCase() +
                    resource.compositeIdentifier.type.slice(1)
                }: ${resource.compositeIdentifier.id.substring(
                    resource.compositeIdentifier.id.length - 4
                )}`,
                vectorCoords: getPointInSphere(sphereSize),
            };
        });

    resourceNodes = [...new Map(resourceNodes.map((node) => [node['nodeId'], node])).values()];

    // console.log(resourceNodes);

    const noteEdges = dualConnections
        .map(({ note, connectedResources }) => {
            return { note: note, connectedResources: connectedResources };
        })
        .map((resourceConnection) => {
            return {
                note: resourceConnection.note,
                from: resourceConnection.connectedResources[0],
                to: resourceConnection.connectedResources[1],
            };
        })
        .map((resourceConnection) => {
            const toCoords = getNodeCoordinates(
                `${resourceConnection.to.compositeIdentifier.type}/${resourceConnection.to.compositeIdentifier.id}`,
                resourceNodes
            );
            const fromCoords = getNodeCoordinates(
                `${resourceConnection.from.compositeIdentifier.type}/${resourceConnection.from.compositeIdentifier.id}`,
                resourceNodes
            );

            return {
                note: resourceConnection.note,
                toCoords: toCoords,
                fromCoords: fromCoords,
            };
        });

    // console.log(noteEdges);

    return (
        <>
            <FullScreenContainer>
                <WebTest3dGUI resourceNodes={resourceNodes} noteEdges={noteEdges} />
            </FullScreenContainer>
        </>
    );
};
