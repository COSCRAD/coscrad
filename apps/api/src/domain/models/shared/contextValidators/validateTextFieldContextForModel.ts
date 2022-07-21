import { InternalError } from '../../../../lib/errors/InternalError';
import isStringWithNonzeroLength from '../../../../lib/utilities/isStringWithNonzeroLength';
import EmptyTargetForTextFieldContextError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/textFieldContext/EmptyTargetForTextFieldContextError';
import InconsistentCharRangeError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/textFieldContext/InconsistentCharRangeError';
import { Valid } from '../../../domainModelValidators/Valid';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { Resource } from '../../resource.entity';

export default (model: Resource, context: TextFieldContext): Valid | InternalError => {
    const { target, charRange } = context;

    const valueOfTargetProperty = model[target];

    // TODO where should we handle the case that the target property is not a string?
    if (!isStringWithNonzeroLength(valueOfTargetProperty))
        return new EmptyTargetForTextFieldContextError(model.getCompositeIdentifier(), target);

    const [_, finalIndex] = charRange;

    if (finalIndex >= valueOfTargetProperty.length)
        return new InconsistentCharRangeError(charRange, model, target);

    return Valid;
};
