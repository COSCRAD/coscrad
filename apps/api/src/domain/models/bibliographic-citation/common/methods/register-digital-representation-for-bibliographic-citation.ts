import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { DTO } from '../../../../../types/DTO';
import { DeepPartial } from '../../../../../types/DeepPartial';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { DigitalTextCompositeId } from '../../../digital-text/commands';
import { IBibliographicCitation } from '../../interfaces/bibliographic-citation.interface';
import { CannotOverrideDigitalRepresentationError } from '../errors';

/**
 * We have considered putting this on a base class for bibliographic citations,
 * but currently we only have an interface, and it is nice to keep the inheritance
 * hierarchies shallow. Mixins have caused trouble with the type system. So we
 * are attempting a third approach where we bind a pure function to this on each
 * class that needs the logic.
 */
export const registerDigitalRepresentationForBibliographicCitation = <
    T extends IBibliographicCitation
>(
    instance: T,
    compositeIdentifier: DigitalTextCompositeId
): ResultOrError<T> => {
    if (isNonEmptyObject(instance.digitalRepresentationResourceCompositeIdentifier))
        return new CannotOverrideDigitalRepresentationError(compositeIdentifier);

    return instance.safeClone<T>({
        // TODO Ensure that we are not overwriting this
        digitalRepresentationResourceCompositeIdentifier: compositeIdentifier,
    } as DeepPartial<DTO<T>>);
};
