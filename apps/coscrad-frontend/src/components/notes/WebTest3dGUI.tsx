// WithHooks.tsx

import {
    ArcRotateCamera,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    Scene,
    Vector3,
} from '@babylonjs/core';
import { AdvancedDynamicTexture, Button } from '@babylonjs/gui/2D';
import SceneComponent from 'babylonjs-hook';

const getPointInSphere = (factor: number) => {
    var u = Math.random();
    var v = Math.random();
    var theta = u * 2.0 * Math.PI;
    var phi = Math.acos(2.0 * v - 1.0);
    var r = Math.cbrt(Math.random());
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);
    var sinPhi = Math.sin(phi);
    var cosPhi = Math.cos(phi);
    var x = r * sinPhi * cosTheta;
    var y = r * sinPhi * sinTheta;
    var z = r * cosPhi;

    return new Vector3(x * factor, y * factor, z * factor);
};

export type ResourceNode = {
    id: string;
    title: string;
};

export type ConnectionByID = [number, number];

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
        const sphereSize: number = 5;

        // Modify this to add a coord property?
        const sphericalCoordinates = nodes.map((point) => getPointInSphere(sphereSize));

        for (i = 0; i < sphericalCoordinates.length; i++) {
            // Our built-in 'box' shape.
            spheres[i] = MeshBuilder.CreateSphere(`sphere-${nodes[i]}`, { diameter: 0.5 }, scene);

            // Move the sphere upward 1/2 its height
            const spherePosition = sphericalCoordinates[i];
            console.log(spherePosition);

            spheres[i].position = spherePosition;

            planes[i] = MeshBuilder.CreatePlane(`plane-${nodes[i]}`, { width: 1, height: 0.8 });
            planes[i].parent = spheres[i];
            // planes[i].position.x = spherePosition.x + 0.5;
            planes[i].position.y = 0.6;
            planes[i].billboardMode = Mesh.BILLBOARDMODE_ALL;

            var advancedTexture = AdvancedDynamicTexture.CreateForMesh(planes[i]);

            buttons[i] = Button.CreateSimpleButton(`button-${nodes[i]}`, `Note ${nodes[i]}`);
            buttons[i].width = 1;
            buttons[i].height = 0.4;
            buttons[i].color = 'white';
            buttons[i].fontSize = 100;
            buttons[i].background = 'green';
            advancedTexture.addControl(buttons[i]);
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
