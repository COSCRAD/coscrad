import buildLineChainValidator from './buildLineChainValidator';
import buildPointChainValidator from './buildPointChainValidator';
import buildPolygonChainValidator from './buildPolygonChainValidator';

/**
 * A chain validator takes in an error of arrays from other validators. It adds
 * no new errors to the array if
 * - the `type` of the model it receives does not apply
 * - there are no errors
 */
export default () => [
    buildPointChainValidator(),
    buildLineChainValidator(),
    buildPolygonChainValidator(),
];
