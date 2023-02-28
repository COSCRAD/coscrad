import { Vector3 } from '@babylonjs/core';
import {
    EdgeConnectionType,
    IDetailQueryResult,
    INoteViewModel,
    WithTags,
} from '@coscrad/api-interfaces';
import { Button } from '@mui/material';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import './babylonjs.css';
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

    const webNodes: ResourceNode[] = notes
        .filter((note) => note.connectionType == EdgeConnectionType.dual)
        .map(({ id, note, connectionType }) => {
            return {
                id: id,
                title: note.substring(0, 12),
                connectionType: connectionType,
                vectorCoords: getPointInSphere(sphereSize),
            };
        });

    const connectedResources = notes
        .filter((note) => note.connectionType == EdgeConnectionType.dual)
        .map(({ connectedResources }) => connectedResources)
        .map((resourceConnection) => resourceConnection)
        .map(([to, from]) => {
            console.log({ from: from.compositeIdentifier });
            console.log({ to: to.compositeIdentifier });
        });

    const placeholderConnections: ConnectionByID[] = [[2, 1]];

    const handle = useFullScreenHandle();

    return (
        <>
            <Button variant="contained" onClick={handle.enter}>
                Enter fullscreen
            </Button>
            <FullScreen handle={handle}>
                <WebTest3dGUI nodes={webNodes} connectionsById={placeholderConnections} />
            </FullScreen>
        </>
    );
};
