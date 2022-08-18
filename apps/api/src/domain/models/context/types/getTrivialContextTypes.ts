import { EdgeConnectionContextType } from './EdgeConnectionContextType';

/**
 * We build this to avoid shared references.
 */
export default (): EdgeConnectionContextType[] => [
    EdgeConnectionContextType.general,
    EdgeConnectionContextType.identity,
];
