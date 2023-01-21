import * as BABYLON from 'babylonjs';
import { Vector3 } from 'babylonjs';
import { ConnectionByID, ResourceNode } from '../WebTestBreakdown2';
import BabylonScene, { SceneEventArgs } from './BabylonScene/';

export interface Web3DTestThreeReact {
    nodes: ResourceNode[];
    connectionsById: ConnectionByID[];
}

const convertRaw3DCoordinatesToVector3 = (coordinates) => {
    return new BABYLON.Vector3(coordinates[0], coordinates[1], coordinates[2]);
};

const convertEdgeEndPointsToVector3 = (edgeCoordinates) => {
    return [
        new Vector3(edgeCoordinates[0][0], edgeCoordinates[0][1], edgeCoordinates[0][2]),
        new Vector3(edgeCoordinates[1][0], edgeCoordinates[1][1], edgeCoordinates[1][2]),
    ];
};

export const Web3DTestThreeReact = ({
    nodes,
    connectionsById,
}: Web3DTestThreeReact): JSX.Element => {
    const onSceneMount = (e: SceneEventArgs) => {
        const { canvas, scene, engine } = e;

        const getEdgeEndPoints = (id1, id2) => {
            const edgeEndPoints = nodes.reduce((acc, { id, coordinates }) => {
                if (id === id1 || id === id2) {
                    return [...acc, coordinates];
                }
                return acc;
            }, []);

            return edgeEndPoints;
        };

        // This creates and positions a free camera (non-mesh)
        const camera = new BABYLON.ArcRotateCamera(
            'camera',
            0,
            0,
            0,
            new BABYLON.Vector3(0, 0, 60),
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

        var sphereColor = new BABYLON.StandardMaterial('sphereColor');
        sphereColor.diffuseColor = new BABYLON.Color3(0.04, 0.86, 0.97);
        sphereColor.alpha = 0.8;

        const spheres = [];
        for (let i = 0; i < nodes.length; i++) {
            spheres[i] = BABYLON.MeshBuilder.CreateSphere(
                `sphere${i}`,
                { diameter: 2, segments: 32 },
                scene
            );

            spheres[i].material = sphereColor;
            spheres[i].position = convertRaw3DCoordinatesToVector3(nodes[i].coordinates);
        }

        const lineColors = [
            new BABYLON.Color4(1, 0, 0, 1),
            new BABYLON.Color4(0, 1, 0, 1),
            new BABYLON.Color4(0, 0, 1, 1),
            new BABYLON.Color4(1, 1, 0, 1),
        ];

        const lines = [];
        for (let i = 0; i < connectionsById.length; i++) {
            const pointsData = getEdgeEndPoints(connectionsById[i][0], connectionsById[i][1]);

            const points = convertEdgeEndPointsToVector3(pointsData);
            lines[i] = BABYLON.CreateLines(`line${i}`, { points: points, colors: lineColors });
        }

        engine.runRenderLoop(() => {
            if (scene) {
                scene.render();
            }
        });
    };

    return <BabylonScene width={100} height={100} onSceneMount={onSceneMount} />;
};
