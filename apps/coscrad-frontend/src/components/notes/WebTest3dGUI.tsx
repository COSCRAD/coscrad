import {
    ArcRotateCamera,
    Color3,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    Scene,
    StandardMaterial,
    Vector3,
} from '@babylonjs/core';
import { AdvancedDynamicTexture, Button } from '@babylonjs/gui/2D';
import SceneComponent from 'babylonjs-hook';
import { NoteEdge, ResourceNode } from './BabylonJSTestContainer';

export type ConnectionByID = [string, string];

export interface WebTest3dGUIProps {
    resourceNodes: ResourceNode[];
    noteEdges: NoteEdge[];
}

export const WebTest3dGUI = ({ resourceNodes, noteEdges }: WebTest3dGUIProps): JSX.Element => {
    type OnSceneReadyHandler = (scene: Scene) => void;

    type OnRenderHandler = (scene: Scene) => void;

    const onSceneReady: OnSceneReadyHandler = (scene) => {
        // This creates and positions a free camera (non-mesh)
        var camera = new ArcRotateCamera('camera', 0, 0, 0, new Vector3(0, 0, 10), scene);

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
        let lines: Mesh[] = [];
        let planes: Mesh[] = [];
        let buttons: Button[] = [];
        let i: number;
        const r: number = 20;
        const sphereMat = new StandardMaterial('s_mat', scene);
        sphereMat.diffuseColor = new Color3(0, 0.45, 0.71);
        const lineMat = new StandardMaterial('l_mat', scene);
        lineMat.diffuseColor = new Color3(0, 0.29, 0.45);

        for (i = 0; i < resourceNodes.length; i++) {
            spheres[i] = MeshBuilder.CreateSphere(
                `sphere-${resourceNodes[i].nodeId}`,
                { diameter: 0.5 },
                scene
            );

            spheres[i].material = sphereMat;

            spheres[i].position = resourceNodes[i].vectorCoords;

            planes[i] = MeshBuilder.CreatePlane(`plane-${resourceNodes[i]}`, {
                width: 1.5,
                height: 1,
            });

            planes[i].parent = spheres[i];
            planes[i].position.y = 0.6;
            planes[i].billboardMode = Mesh.BILLBOARDMODE_ALL;

            var advancedTexture = AdvancedDynamicTexture.CreateForMesh(planes[i]);

            buttons[i] = Button.CreateSimpleButton(
                `button-${resourceNodes[i].nodeId}`,
                resourceNodes[i].title
            );
            buttons[i].width = 1;
            buttons[i].height = 0.4;
            buttons[i].color = 'white';
            buttons[i].fontSize = 100;
            buttons[i].background = 'green';
            advancedTexture.addControl(buttons[i]);
        }

        for (i = 0; i < noteEdges.length; i++) {
            const points = [noteEdges[i].toCoords, noteEdges[i].fromCoords];

            const delta = points[1].subtract(points[0]).scale(1 / 2);
            const lineMidPoint = noteEdges[i].fromCoords.add(delta.scale(0.5));

            console.log({ lineMidPoint });
            console.log({ delta });
            console.log({ to: noteEdges[i].toCoords });
            console.log({ from: noteEdges[i].fromCoords });

            lines[i] = MeshBuilder.CreateLines(`line-${i}`, {
                points: points,
            });

            lines[i].material = lineMat;

            planes[i] = MeshBuilder.CreatePlane(`plane-${i}`, {
                width: 1.5,
                height: 1,
            });

            planes[i].position = lineMidPoint;
            // planes[i].position.y = planes[i].position.y + 1;
            // planes[i].parent = lines[i];
            // planes[i].position.y = 0.6;
            planes[i].billboardMode = Mesh.BILLBOARDMODE_ALL;

            var advancedTexture = AdvancedDynamicTexture.CreateForMesh(planes[i]);

            buttons[i] = Button.CreateSimpleButton(`button-${i}`, noteEdges[i].note);
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
