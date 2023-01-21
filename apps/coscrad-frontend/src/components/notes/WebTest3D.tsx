import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Engine, Scene, useScene } from 'react-babylonjs';
import { BabylonJSDataFrame } from './prepareBabylonJSDataFrame';

import './WebTest3D.css';

const convertRaw3DEndPointCoordinatesToVector3 = (endPointCoordinates) => {
    return [
        new Vector3(
            endPointCoordinates[0][0],
            endPointCoordinates[0][1],
            endPointCoordinates[0][2]
        ),
        new Vector3(
            endPointCoordinates[1][0],
            endPointCoordinates[1][1],
            endPointCoordinates[1][2]
        ),
    ];
};

export const WebTest3D = ({ resourceNodes, noteEdges }: BabylonJSDataFrame): JSX.Element => {
    const scene = useScene();

    const getWebSpheres = () => {
        let webSpheres = resourceNodes.map(({ id, coordinates }, index) => {
            const position = new Vector3(coordinates[0], coordinates[1], coordinates[2]);
            // console.log({ id: id, position: position });

            return (
                <sphere
                    key={`node-${index}-key`}
                    name={`node-${index}`}
                    diameter={1.2}
                    position={position}
                >
                    <standardMaterial
                        name={`sphere-${index}-mat`}
                        diffuseColor={new Color3(0.04, 0.14, 0.99)}
                    ></standardMaterial>
                </sphere>
            );
        });

        return webSpheres;
    };

    const getWebLines = () => {
        let webLines = noteEdges.map(({ id, note, endPointCoordinates }, index) => {
            const points = convertRaw3DEndPointCoordinatesToVector3(endPointCoordinates);
            // console.log({ note: note, points: points });
            // console.log({ points });

            return (
                <lines
                    key={`edge-${index}`}
                    name={`edge-${index}`}
                    points={points}
                    color={new Color3(0.67, 0.98, 1)}
                />
            );
        });

        return webLines;
    };

    const spheres = getWebSpheres();
    const lines = getWebLines();

    return (
        <div>
            <Engine antialias adaptToDeviceRatio canvasId="babylon-canvas">
                <Scene>
                    <arcRotateCamera
                        name="camera1"
                        target={Vector3.Zero()}
                        alpha={Math.PI / 2}
                        beta={Math.PI / 4}
                        radius={8}
                    />
                    <hemisphericLight name="light1" intensity={0.7} direction={Vector3.Forward()} />
                    {spheres}
                    {lines}
                </Scene>
            </Engine>
        </div>
    );
};
