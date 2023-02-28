// WithHooks.tsx

import {
    ArcRotateCamera,
    Color4,
    CreateLines,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    Scene,
    Vector3,
} from '@babylonjs/core';
import { AdvancedDynamicTexture, Button } from '@babylonjs/gui/2D';
import SceneComponent from 'babylonjs-hook';
import { ResourceNode } from './BabylonJSTestContainer';

export type ConnectionByID = [string, string];

export interface WebTest3dGUIProps {
    nodes: ResourceNode[];
    connectionsById: ConnectionByID[];
}

export const WebTest3dGUI = ({ nodes, connectionsById }: WebTest3dGUIProps): JSX.Element => {
    type OnSceneReadyHandler = (scene: Scene) => void;

    type OnRenderHandler = (scene: Scene) => void;

    const onSceneReady: OnSceneReadyHandler = (scene) => {
        // This creates and positions a free camera (non-mesh)
        var camera = new ArcRotateCamera('camera', 0, 0, 0, new Vector3(0, 3, 10), scene);

        // This targets the camera to scene origin
        camera.setTarget(Vector3.Zero());

        const canvas = scene.getEngine().getRenderingCanvas();

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        let spheres: Mesh[] = [];
        let planes: Mesh[] = [];
        let buttons: Button[] = [];
        let i: number;
        const r: number = 20;

        for (i = 0; i < nodes.length; i++) {
            // Our built-in 'box' shape.
            spheres[i] = MeshBuilder.CreateSphere(
                `sphere-${nodes[i].id}`,
                { diameter: 0.5 },
                scene
            );

            spheres[i].position = nodes[i].vectorCoords;

            planes[i] = MeshBuilder.CreatePlane(`plane-${nodes[i]}`, { width: 1, height: 0.8 });
            planes[i].parent = spheres[i];
            // planes[i].position.x = spherePosition.x + 0.5;
            planes[i].position.y = 0.6;
            planes[i].billboardMode = Mesh.BILLBOARDMODE_ALL;

            var advancedTexture = AdvancedDynamicTexture.CreateForMesh(planes[i]);

            buttons[i] = Button.CreateSimpleButton(
                `button-${nodes[i].id}`,
                `Note ${nodes[i].title}`
            );
            buttons[i].width = 1;
            buttons[i].height = 0.4;
            buttons[i].color = 'white';
            buttons[i].fontSize = 100;
            buttons[i].background = 'green';
            advancedTexture.addControl(buttons[i]);
        }

        const lineColors = [
            new Color4(1, 0, 0, 1),
            new Color4(0, 1, 0, 1),
            new Color4(0, 0, 1, 1),
            new Color4(1, 1, 0, 1),
        ];

        const lines = [];
        for (let i = 0; i < connectionsById.length; i++) {
            const pointsData = getEdgeEndPoints(connectionsById[i][0], connectionsById[i][1]);

            const points = convertEdgeEndPointsToVector3(pointsData);
            lines[i] = CreateLines(`line${i}`, { points: points, colors: lineColors });
        }
    };

    return (
        <div>
            <SceneComponent antialias onSceneReady={onSceneReady}>
                {/* <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender}> */}
                {/* <BabylonGUI /> */}
            </SceneComponent>
        </div>
    );
};
