import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { ResourceType } from '../../types/ResourceType';
import { isNullOrUndefined } from '../../utilities/validation/is-null-or-undefined';
import { EdgeConnectionContextType } from '../context/types/EdgeConnectionContextType';

/**
 * Couldn't we have a `getAllowedContextTypes` on the class as a static method?
 * If not, maybe we can do this with annotation:
 * @AllowedContextTypes(contextTypes: EdgeConnectionContextType[])
 *
 * Better yet
 * @AllowedContext(contextCtors: Ctor<ContextUnion>p[])
 *
 * and then on the Context classes:
 * @EdgeConnectionContext(contextType)
 * becomes the source of truth for the various context types.
 *
 */
const resourceTypeToAllowedContextTypes: Record<ResourceType, string[]> = {
    [ResourceType.book]: [
        EdgeConnectionContextType.general,
        EdgeConnectionContextType.identity,
        EdgeConnectionContextType.pageRange,
    ],
    [ResourceType.photograph]: [
        EdgeConnectionContextType.general,
        // TODO Support point2D context for Photographs
        // EdgeConnectionContextType.point2D,
        // TODO Support FreeMultilineContext for Photographs
        // EdgeConnectionContextType.freeMultiline,
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
    [ResourceType.audioItem]: [
        EdgeConnectionContextType.general,
        EdgeConnectionContextType.timeRange,
    ],
    [ResourceType.video]: [
        EdgeConnectionContextType.general,
        EdgeConnectionContextType.timeRange,
        // TODO support polygons
    ],
    [ResourceType.vocabularyList]: [
        EdgeConnectionContextType.general,
        EdgeConnectionContextType.textField,
    ],
    [ResourceType.bibliographicReference]: [
        EdgeConnectionContextType.general,
        EdgeConnectionContextType.identity,
    ],
    [ResourceType.digitalText]: [EdgeConnectionContextType.general],
    [ResourceType.song]: [EdgeConnectionContextType.general, EdgeConnectionContextType.timeRange],
    [ResourceType.mediaItem]: [
        EdgeConnectionContextType.general,
        EdgeConnectionContextType.timeRange,
    ],
    [ResourceType.playlist]: [EdgeConnectionContextType.general],
};

export const getResourceTypesThatOnlySupportGeneralContext = (): ResourceType[] =>
    Object.keys(resourceTypeToAllowedContextTypes).filter((key) => {
        const value = resourceTypeToAllowedContextTypes[key];
        return value.length === 1 && value[0] === EdgeConnectionContextType.general;
    }) as ResourceType[];

export const getAllowedContextsForModel = (resourceType: ResourceType): string[] => {
    const allowedContexts = resourceTypeToAllowedContextTypes[resourceType];

    return isNullOrUndefined(allowedContexts) ? [] : cloneToPlainObject(allowedContexts);
};

export default (contextType: string, resourceType: ResourceType): boolean =>
    resourceTypeToAllowedContextTypes[resourceType].includes(contextType);
