import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { ResourceType } from '../../types/ResourceType';
import { isNullOrUndefined } from '../../utilities/validation/is-null-or-undefined';
import { EdgeConnectionContextType } from '../context/types/EdgeConnectionContextType';

const resourceTypeToAllowedContextTypes = {
    [ResourceType.book]: [
        EdgeConnectionContextType.general,
        EdgeConnectionContextType.identity,
        EdgeConnectionContextType.pageRange,
    ],
    [ResourceType.photograph]: [
        EdgeConnectionContextType.general,
        EdgeConnectionContextType.point2D,
        EdgeConnectionContextType.freeMultiline,
    ],
    [ResourceType.spatialFeature]: [
        EdgeConnectionContextType.general,
        /**
         * TODO [https://www.pivotaltracker.com/story/show/181978898]
         *
         * Support specific context models for spatial features.
         */
        // EdgeConnectionContextType.point2D,
        // EdgeConnectionContextType.freeMultiline,
    ],
    [ResourceType.term]: [EdgeConnectionContextType.general, EdgeConnectionContextType.textField],
    [ResourceType.transcribedAudio]: [
        EdgeConnectionContextType.general,
        EdgeConnectionContextType.timeRange,
    ],
    [ResourceType.vocabularyList]: [
        EdgeConnectionContextType.general,
        EdgeConnectionContextType.textField,
    ],
    [ResourceType.bibliographicReference]: [
        EdgeConnectionContextType.general,
        EdgeConnectionContextType.identity,
    ],
    [ResourceType.song]: [EdgeConnectionContextType.general, EdgeConnectionContextType.timeRange],
    [ResourceType.mediaItem]: [
        EdgeConnectionContextType.general,
        EdgeConnectionContextType.textField,
        EdgeConnectionContextType.timeRange,
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
