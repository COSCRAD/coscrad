import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Engine, Scene, useScene } from 'react-babylonjs';

import './WebTest3D.css';

export const WebTestBreakdown = (): JSX.Element => {
    const scene = useScene();

    const convertToVector3 = (edgeCoordinates) => {
        return [
            new Vector3(edgeCoordinates[0][0], edgeCoordinates[0][1], edgeCoordinates[0][2]),
            new Vector3(edgeCoordinates[1][0], edgeCoordinates[1][1], edgeCoordinates[1][2]),
        ];
    };

    const nodes = [
        { id: 1, pos: [1, 4, 3] },
        { id: 2, pos: [5, 5, 1] },
        { id: 3, pos: [2, 3, 1] },
        { id: 4, pos: [8, 5, 6] },
        { id: 5, pos: [-4, -3, 1] },
        { id: 6, pos: [2, -6, 5] },
        { id: 7, pos: [3, 8, -1] },
        { id: 8, pos: [7, 2, 6] },
    ];

    const connectionsById = [
        [1, 2],
        [3, 1],
        [8, 1],
        [5, 3],
        [2, 6],
        [8, 2],
        [2, 5],
    ];

    const getEdgeEndPoints = (id1, id2) => {
        const edgeEndPoints = nodes.reduce((acc, currentValue) => {
            const { id, pos } = currentValue;
            if (id === id1 || id === id2) {
                return [...acc, pos];
            }
            return acc;
        }, []);

        return edgeEndPoints;
    };

    const getNodeSpheres = () => {
        let nodeSpheres = nodes.map((node, index) => {
            const { id, pos } = node;
            const position = new Vector3(pos[0], pos[1], pos[2]);

            // console.log({ position });

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

        return nodeSpheres;
    };

    const getEdgeLines = () => {
        let edgeLines = connectionsById.map((edgeById, index) => {
            const pointsData = getEdgeEndPoints(edgeById[0], edgeById[1]);
            const points = convertToVector3(pointsData);
            console.log({ points });

            return (
                <lines
                    key={`edge-${index}`}
                    name={`edge-${index}`}
                    points={points}
                    color={new Color3(0.67, 0.98, 1)}
                />
            );
        });

        return edgeLines;
    };

    const nodeSpheres = getNodeSpheres();
    const edgeLines = getEdgeLines();

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
                    {nodeSpheres}
                    {edgeLines}
                </Scene>
            </Engine>
        </div>
    );
};
