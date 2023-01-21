import * as BABYLON from 'babylonjs';
import { ConnectionByID, ResourceNode } from '../WebTestBreakdown2';
import BabylonScene, { SceneEventArgs } from './BabylonScene/';

export interface Web3DTestThreeReact {
    nodes: ResourceNode[];
    connectionsById: ConnectionByID[];
}

const convertRaw3DCoordinatesToVector3 = (coordinates) => {
    return new BABYLON.Vector3(coordinates[0][0], coordinates[0][1], coordinates[0][2]);
};

export const Web3DTestThreeReact = ({
    nodes,
    connectionsById,
}: Web3DTestThreeReact): JSX.Element => {
    const onSceneMount = (e: SceneEventArgs) => {
        const { canvas, scene, engine } = e;

        // This creates and positions a free camera (non-mesh)
        const camera = new BABYLON.ArcRotateCamera(
            'camera',
            0,
            0,
            0,
            new BABYLON.Vector3(0, 0, 0),
            scene
        );
        // This targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());
        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);
        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;
        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene

        const spheres = [];
        for (let i = 0; i < nodes.length; i++) {
            spheres[i] = BABYLON.MeshBuilder.CreateSphere(
                `sphere${i}`,
                { diameter: 2, segments: 32 },
                scene
            );

            spheres[i].position = convertRaw3DCoordinatesToVector3(nodes[i].coordinates);
        }

        engine.runRenderLoop(() => {
            if (scene) {
                scene.render();
            }
        });
    };

    return <BabylonScene width={100} height={100} onSceneMount={onSceneMount} />;
};
