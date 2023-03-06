import { Vector3 } from '@babylonjs/core';
import { Engine, Scene } from 'react-babylonjs';
import { Sphere } from './sphere';

interface WebTest3dRBProps {}

export const WebTest3dRB = (): JSX.Element => {
    const name = 'sphere 1';
    const position = new Vector3(0, 0, 12);

    return (
        <Engine antialias adaptToDeviceRatio canvasId="babylon-canvas">
            <Scene>
                <arcRotateCamera
                    name="camera1"
                    target={Vector3.Zero()}
                    alpha={Math.PI / 2}
                    beta={Math.PI / 4}
                    radius={8}
                />
                <hemisphericLight name="light1" intensity={0.7} direction={Vector3.Up()} />
                <Sphere name={name} position={position} />
            </Scene>
        </Engine>
    );
};
