import { Color3, Mesh, Nullable, Vector3 } from '@babylonjs/core';
import { useRef } from 'react';

interface SphereProps {
    name: string;
    position: Vector3;
    color: Color3;
}

export const Sphere = ({ name, position, color }: SphereProps): JSX.Element => {
    let sphereRef = useRef<Nullable<Mesh>>(null);

    return (
        <sphere
            ref={sphereRef}
            name={`${name}-sphere`}
            diameter={2}
            segments={16}
            position={position}
        ></sphere>
    );
};
