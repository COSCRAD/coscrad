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
            new BABYLON.Vector3(4, 20, 100),
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

        //Set font type
        var font_type = 'Arial';

        //Set width an height for plane
        var boxWidth = 10;
        var boxHeight = 3;
        var boxDepth = 1;

        const spheres = [];
        const texts = [];
        for (let i = 0; i < nodes.length; i++) {
            const boxCoordinates = convertRaw3DCoordinatesToVector3(nodes[i].coordinates);

            spheres[i] = BABYLON.MeshBuilder.CreateSphere(`box${i}`, { diameter: 10 }, scene);

            //Set width and height for dynamic texture using same multiplier
            const fontFactor = 20;
            var DTWidth = boxWidth * fontFactor;
            var DTHeight = boxHeight * fontFactor;

            //Set text
            texts[i] = nodes[i].id;

            //Create dynamic texture
            var dynamicTexture = new BABYLON.DynamicTexture(
                'DynamicTexture',
                { width: DTWidth, height: DTHeight },
                scene
            );

            //Check width of text for given font type at any size of font
            var ctx = dynamicTexture.getContext();
            var size = 5; //any value will work
            ctx.font = size + 'px ' + font_type;
            var textWidth = ctx.measureText(texts[i]).width;

            //Calculate ratio of text width to size of font used
            var ratio = textWidth / size;

            //set font to be actually used to write text on dynamic texture
            var font_size = Math.floor(DTWidth / (ratio * 2)); //size of multiplier (1) can be adjusted, increase for smaller text
            var font = font_size + 'px ' + font_type;

            //Draw text
            const textOpt = texts[i];
            const xOpt = 1;
            const yOpt = null;
            const fontOpt = font;
            const colorOpt = '#000000';
            const canvasColorOpt = '#ffffff';
            const intertYOpt = true;
            const updateOpt = true;

            dynamicTexture.drawText(
                textOpt,
                xOpt,
                yOpt,
                fontOpt,
                colorOpt,
                canvasColorOpt,
                intertYOpt,
                updateOpt
            );

            //create material
            var mat = new BABYLON.StandardMaterial('mat', scene);
            mat.diffuseTexture = dynamicTexture;
            dynamicTexture.wAng = BABYLON.Tools.ToRadians(180);

            //apply material
            spheres[i].material = mat;
            spheres[i].position = boxCoordinates;
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
