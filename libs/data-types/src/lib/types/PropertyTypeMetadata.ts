import { CoscradDataType } from './CoscradDataType';

export type PropertyTypeMetadata = {
    isOptional: boolean;

    isArray: boolean;

    type: CoscradDataType;
};
