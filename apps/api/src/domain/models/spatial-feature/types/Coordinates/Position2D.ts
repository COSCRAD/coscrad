import isFiniteNumber from '../../../../../lib/utilities/isFiniteNumber';

export type Position2D = [number, number];

export const isPosition2D = (input: unknown): input is Position2D =>
    Array.isArray(input) && input.length === 2 && input.every(isFiniteNumber);
