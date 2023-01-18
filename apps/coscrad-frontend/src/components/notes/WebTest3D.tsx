import { DynamicTexture } from '@babylonjs/core';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { INoteViewModel } from '@coscrad/api-interfaces';
import { useCallback } from 'react';
import { Engine, Scene, useScene } from 'react-babylonjs';

import { HasData } from '../higher-order-components';
import './WebTest3D.css';

export const WebTest3D = ({ data: notes }: HasData<INoteViewModel[]>): JSX.Element => {
    const scene = useScene();

    const ref = useCallback((node) => {
        const myDynamicTexture = new DynamicTexture('fire', 256, scene);
        let ctx = myDynamicTexture.getContext();

        //draw here with the context (ctx)

        //update if necessary
        myDynamicTexture.update();

        node.diffuseTexture = myDynamicTexture;
        node.opacityTexture = myDynamicTexture;
    }, []);

    return (
        <div>
            <Engine antialias adaptToDeviceRatio canvasId="babylon-canvas">
                <Scene>
                    <universalCamera
                        name="camera1"
                        position={new Vector3(0, 5, -10)}
                        target={Vector3.Zero()}
                    />
                    <hemisphericLight name="light1" intensity={0.7} direction={Vector3.Up()} />
                    {notes.map((note, index) => (
                        <sphere
                            name={`box-${index}`}
                            diameter={0.8}
                            position={
                                new Vector3(
                                    index * Math.random(),
                                    index * Math.random(),
                                    index * Math.random()
                                )
                            }
                        >
                            <standardMaterial
                                ref={ref}
                                name={`box-${index}-mat`}
                            ></standardMaterial>
                        </sphere>
                    ))}
                </Scene>
            </Engine>
        </div>
    );
};
