// eslint-disable-next-line @nx/enforce-module-boundaries
import { CoscradComplexDataType as ComplexCoscradDataType } from '@coscrad/api-interfaces';

export { ComplexCoscradDataType };

export const isComplexCoscradDataType = (input: unknown): input is ComplexCoscradDataType =>
    Object.values(ComplexCoscradDataType).includes(input as ComplexCoscradDataType);
