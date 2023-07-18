import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { InternalError } from '../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../lib/types/not-found';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { Valid } from '../../../domainModelValidators/Valid';
import EmptyTargetForTextFieldContextError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/textFieldContext/EmptyTargetForTextFieldContextError';
import InconsistentCharRangeError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/textFieldContext/InconsistentCharRangeError';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { Resource } from '../../resource.entity';

export default (model: Resource, context: TextFieldContext): Valid | InternalError => {
    const { target, charRange, languageCode } = context;

    const valueOfTargetProperty = model[target];

    if (isNullOrUndefined(valueOfTargetProperty))
        return new EmptyTargetForTextFieldContextError(model.getCompositeIdentifier(), target);

    /**
     * Note that the types have already been validated elsewhere. At this
     * level, we are simply validating that the **state** of the resource is
     * consistent with the context instance.
     */
    const multilingualTextProperty = valueOfTargetProperty as MultilingualText;

    const translation = multilingualTextProperty.getTranslation(languageCode);

    // TODO include the language code in the error
    if (isNotFound(translation))
        return new EmptyTargetForTextFieldContextError(model.getCompositeIdentifier(), target);

    const translatedText = translation.text;

    const [_, finalIndex] = charRange;

    if (finalIndex >= translatedText.length)
        return new InconsistentCharRangeError(charRange, model, target, translatedText);

    return Valid;
};
