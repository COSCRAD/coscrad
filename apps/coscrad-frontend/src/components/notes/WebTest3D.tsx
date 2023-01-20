import { Color3 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { EdgeConnectionType } from '@coscrad/api-interfaces';
import { Engine, Scene, useScene } from 'react-babylonjs';
import { NoteIndexState } from '../../store/slices/notes/types/note-index-state';

import './WebTest3D.css';

export const WebTest3D = ({ entities: notes }: NoteIndexState): JSX.Element => {
    const scene = useScene();

    const compositeIdentifierToStringID = (compositeIdentifier) => {
        return `${compositeIdentifier.type}/${compositeIdentifier.id}`;
    };

    const isDual = (type) => (type === EdgeConnectionType.dual ? true : false);

    const dualNotes = notes.filter(({ connectionType }) => isDual(connectionType));

    const connectedResources = dualNotes.map((note) => note.connectedResources);

    const resourceNodes = connectedResources
        .map((connection) =>
            connection.map((resource) =>
                compositeIdentifierToStringID(resource.compositeIdentifier)
            )
        )
        .reduce((acc, currentValue) => acc.concat(currentValue), [])
        .reduce((acc, currentValue) => {
            if (!acc.includes(currentValue)) {
                return [...acc, currentValue];
            }
            return acc;
        }, [])
        .reduce((acc, currentValue, index) => {
            const factor = index % 2 === 0 ? -index + 4 : index + 4;
            const emptyArray = [0, 0, 0];
            const coords = emptyArray.reduce((coordAcc, coordCurrent) => {
                return [...coordAcc, factor * Math.random() + Math.random() * 6];
            }, []);

            return [...acc, { id: currentValue, nodeCoordinates: coords }];
        }, []);

    const getCoordinatesById = (stringID) => {
        const newCoords = resourceNodes.reduce((acc, currentValue) => {
            const { id, nodeCoordinates } = currentValue;
            if (stringID === id) {
                // console.log({ nodeCoordinates });

                return acc.concat(nodeCoordinates);
            }
            return acc;
        }, []);
        return newCoords;
    };

    // console.log(dualNotes);

    const noteEdges = dualNotes.map(({ id, note, connectedResources }) => {
        const edgeCoordinates = connectedResources.map(({ compositeIdentifier }) => {
            const stringID = compositeIdentifierToStringID(compositeIdentifier);
            const newCoords = getCoordinatesById(stringID);
            // console.log({ newCoords });

            return newCoords;
        });
        return { id: id, note: note, edgeCoordinates: edgeCoordinates };
    });

    const convertToVector3 = (edgeCoordinates) => {
        return [
            new Vector3(edgeCoordinates[0][0], edgeCoordinates[0][1], edgeCoordinates[0][2]),
            new Vector3(edgeCoordinates[1][0], edgeCoordinates[1][1], edgeCoordinates[1][2]),
        ];
    };

    const points = noteEdges.map(({ edgeCoordinates }) => {
        return convertToVector3(edgeCoordinates);
    });

    // points.map((line) => {
    //     console.log({ line });
    // });
    // console.log({ points });

    const getWebSpheres = () => {
        let webSpheres = resourceNodes.map((node, index) => {
            const { id, nodeCoordinates } = node;
            const position = new Vector3(
                nodeCoordinates[0],
                nodeCoordinates[1],
                nodeCoordinates[2]
            );

            console.log({ id: id, pos: position });

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
        let webLines = noteEdges.map((edge, index) => {
            const { id, note, edgeCoordinates } = edge;
            const points = convertToVector3(edgeCoordinates);
            console.log({ note: note, points: points });

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
