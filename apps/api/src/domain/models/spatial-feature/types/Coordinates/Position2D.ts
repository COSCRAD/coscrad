import { isFiniteNumber } from '@coscrad/validation-constraints';

export type Position2D = [number, number];

export const isPosition2D = (input: unknown): input is Position2D =>
    Array.isArray(input) && input.length === 2 && input.every(isFiniteNumber);
