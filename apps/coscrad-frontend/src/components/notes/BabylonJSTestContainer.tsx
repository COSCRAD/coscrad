import { IDetailQueryResult, INoteViewModel, WithTags } from '@coscrad/api-interfaces';
import { Button } from '@mui/material';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import './babylonjs.css';
import { ConnectionByID, WebTest3dGUI } from './WebTest3dGUI';

interface BabylonJSTestContainerProps {
    notes: IDetailQueryResult<WithTags<INoteViewModel>>[];
}

export const BabylonJSTestContainer = ({ notes }: BabylonJSTestContainerProps): JSX.Element => {
    const handle = useFullScreenHandle();

    const webNodes = notes.map(({ id, connectionType }) => {
        return {
            id: id,
            title: `${connectionType} ${id}`,
        };
    });

    const placeholderConnections: ConnectionByID[] = [[2, 1]];

    return (
        <>
            <Button onClick={handle.enter}>Enter fullscreen</Button>
            <FullScreen handle={handle}>
                <WebTest3dGUI nodes={webNodes} connectionsById={placeholderConnections} />
            </FullScreen>
        </>
    );
};
