import isString from 'apps/api/src/lib/utilities/isString';
import { GeometricFeatureType } from './GeometricFeatureType';

export default (input: unknown): input is GeometricFeatureType =>
    isString(input) && input in GeometricFeatureType;
