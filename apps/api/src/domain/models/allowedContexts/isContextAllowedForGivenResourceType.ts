import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { ResourceType, resourceTypes } from '../../types/resourceTypes';
import { isNullOrUndefined } from '../../utilities/validation/is-null-or-undefined';
import { EdgeConnectionContextType } from '../context/types/EdgeConnectionContextType';

const resourceTypeToAllowedContextTypes = {
    [resourceTypes.book]: [EdgeConnectionContextType.general, EdgeConnectionContextType.pageRange],
    [resourceTypes.photograph]: [
        EdgeConnectionContextType.general,
        EdgeConnectionContextType.point2D,
        EdgeConnectionContextType.freeMultiline,
    ],
    [resourceTypes.spatialFeature]: [
        EdgeConnectionContextType.general,
        /**
         * TODO [https://www.pivotaltracker.com/story/show/181978898]
         *
         * Support specific context models for spatial features.
         */
        // EdgeConnectionContextType.point2D,
        // EdgeConnectionContextType.freeMultiline,
    ],
    [resourceTypes.term]: [EdgeConnectionContextType.general, EdgeConnectionContextType.textField],
    [resourceTypes.transcribedAudio]: [
        EdgeConnectionContextType.general,
        EdgeConnectionContextType.timeRange,
    ],
    [resourceTypes.vocabularyList]: [
        EdgeConnectionContextType.general,
        EdgeConnectionContextType.textField,
    ],
    [resourceTypes.bibliographicReference]: [EdgeConnectionContextType.general],
    [resourceTypes.song]: [EdgeConnectionContextType.general, EdgeConnectionContextType.timeRange],
    [resourceTypes.mediaItem]: [
        EdgeConnectionContextType.general,
        EdgeConnectionContextType.textField,
    ],
};

export const getResourceTypesThatOnlySupportGeneralContext = (): ResourceType[] =>
    Object.keys(resourceTypeToAllowedContextTypes).filter((key) => {
        const value = resourceTypeToAllowedContextTypes[key];
        return value.length === 1 && value[0] === EdgeConnectionContextType.general;
    }) as ResourceType[];

export const getAllowedContextsForModel = (
    resourceType: ResourceType
): EdgeConnectionContextType[] => {
    const allowedContexts = resourceTypeToAllowedContextTypes[resourceType];

    return isNullOrUndefined(allowedContexts) ? [] : cloneToPlainObject(allowedContexts);
};

export default (contextType: EdgeConnectionContextType, resourceType: ResourceType): boolean =>
    resourceTypeToAllowedContextTypes[resourceType].includes(contextType);
