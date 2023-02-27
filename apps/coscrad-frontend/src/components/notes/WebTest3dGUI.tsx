// WithHooks.tsx

import {
    ArcRotateCamera,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    Scene,
    Vector3,
} from '@babylonjs/core';
import { Button } from '@babylonjs/gui/2D';
import { AdvancedDynamicTexture } from '@babylonjs/gui/2D/advancedDynamicTexture';
import SceneComponent from 'babylonjs-hook';

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

    const data: number[] = [...Array(10).keys()];
    let spheres: Mesh[] = [];
    let planes: Mesh[] = [];
    let buttons: Button[] = [];
    let i: number;

    for (i = 0; i < data.length; i++) {
        // Our built-in 'box' shape.
        spheres[i] = MeshBuilder.CreateSphere(`sphere-${data[i]}`, { diameter: 2 }, scene);

        // Move the sphere upward 1/2 its height
        const spherePosition = {
            x: data[i] * 4,
            y: 0,
        };
        console.log({ spherePosition });

        spheres[i].position.x = spherePosition.x;
        spheres[i].position.y = spherePosition.y;

        planes[i] = MeshBuilder.CreatePlane(`plane-${data[i]}`, { width: 4, height: 3 });
        planes[i].parent = spheres[i];
        // planes[i].position.x = spherePosition.x + 0.5;
        planes[i].position.y = spherePosition.y + 2;
        planes[i].billboardMode = Mesh.BILLBOARDMODE_ALL;

        var advancedTexture = AdvancedDynamicTexture.CreateForMesh(planes[i]);

        buttons[i] = Button.CreateSimpleButton(`button-${data[i]}`, `Note ${data[i]}`);
        buttons[i].width = 1;
        buttons[i].height = 0.4;
        buttons[i].color = 'white';
        buttons[i].fontSize = 200;
        buttons[i].background = 'green';
        advancedTexture.addControl(buttons[i]);
    }
};

// const BabylonGUI = () => {
//     const scene = useScene();
//     useEffect(() => {
//         if (scene) {
//             console.log('adding button');
//             var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI');

//             var button = Button.CreateSimpleButton('but', 'Click Me');
//             button.width = 0.2;
//             button.height = '40px';
//             button.color = 'white';
//             button.background = 'green';
//             const observer = button.onPointerClickObservable.add((eventData) => {
//                 console.log('clicked eventData:', eventData);
//                 console.log('scene clear (GUI):', scene.clearColor.asArray().join(','));
//             })!;
//             advancedTexture.addControl(button);

//             return () => {
//                 button.onPointerClickObservable.remove(observer);
//             };
//         } else {
//             console.log('scene not ready yet...');
//         }
//     }, [scene]);
//     return null;
// };

export const WebTest3dGUI = (): JSX.Element => (
    <div>
        <SceneComponent antialias onSceneReady={onSceneReady}>
            {/* <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender}> */}
            {/* <BabylonGUI /> */}
        </SceneComponent>
    </div>
);
