import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Engine, Scene, useScene } from 'react-babylonjs';
import { Raw3DCoordinates } from './prepareBabylonJSDataFrame';

import './WebTest3D.css';

type Identifier = string;

export type ResourceNode = {
    id: Identifier;
    coordinates: Raw3DCoordinates;
};

export type ConnectionByID = [Identifier, Identifier];

interface WebTestBreakdownTwoProps {
    nodes: ResourceNode[];
    connectionsById: ConnectionByID[];
}

export const WebTestBreakdownTwo = ({
    nodes,
    connectionsById,
}: WebTestBreakdownTwoProps): JSX.Element => {
    const scene = useScene();

    // console.log({ connectionsById });

    const convertToVector3 = (edgeCoordinates) => {
        // console.log({ edgeCoordinates });
        // console.log({ edgeCoordinates0: edgeCoordinates[0] });
        // console.log({ edgeCoordinates1: edgeCoordinates[1] });

        return [
            new Vector3(edgeCoordinates[0][0], edgeCoordinates[0][1], edgeCoordinates[0][2]),
            new Vector3(edgeCoordinates[1][0], edgeCoordinates[1][1], edgeCoordinates[1][2]),
        ];
    };

    const getEdgeEndPoints = (id1, id2) => {
        const edgeEndPoints = nodes.reduce((acc, { id, coordinates }) => {
            if (id === id1 || id === id2) {
                return [...acc, coordinates];
            }
            return acc;
        }, []);

        return edgeEndPoints;
    };

    const getWeb = () => {
        let nodeSpheres = nodes.map(({ id, coordinates }, index) => {
            const position = new Vector3(coordinates[0], coordinates[1], coordinates[2]);

            console.log({ tsRes: position });

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

        let edgeLines = connectionsById.map((edgeById, index) => {
            const pointsData = getEdgeEndPoints(edgeById[0], edgeById[1]);

            const points = convertToVector3(pointsData);
            console.log({ ts: points });

            return (
                <lines
                    key={`edge-${index}`}
                    name={`edge-${index}`}
                    points={points}
                    color={new Color3(0.67, 0.98, 1)}
                />
            );
        });

        return nodeSpheres.concat(edgeLines);
    };

    const web = getWeb();
    // const nodeSpheres = <lines name="bog1" points={[new Vector3(0, 1, 3)]} />;
    // const edgeLines = <lines name="bog2" points={[new Vector3(0, 1, 3)]} />;

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
                    {web}
                </Scene>
            </Engine>
        </div>
    );
};
