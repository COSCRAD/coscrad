import EmptyTargetForTextFieldContextError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/textFieldContext/EmptyTargetForTextFieldContextError';
import InconsistentCharRangeError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/textFieldContext/InconsistentCharRangeError';
import { resourceTypes } from '../../../types/resourceTypes';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { ResourceModelContextStateValidatorInvalidTestCase } from '../resourceModelContextStateValidators.spec';
import buildAllInvalidTestCasesForResource from '../utilities/buildAllInvalidTestCasesForResource';
import buildAllValidTestCasesForResource from '../utilities/buildAllValidTestCasesForResource';

const validCases = buildAllValidTestCasesForResource(resourceTypes.vocabularyList);

const vocabularyList = validCases[0].resource.clone({
    name: 'foo',
});

const invalidCases: ResourceModelContextStateValidatorInvalidTestCase[] = [
    ...buildAllInvalidTestCasesForResource(resourceTypes.book),
    {
        description: `vocabulary list does not have the property targetted in the text field context`,
        resource: vocabularyList,
        context: new TextFieldContext({
            target: 'bogus',
            charRange: [0, 0],
        }),
        expectedError: new EmptyTargetForTextFieldContextError(vocabularyList, 'bogus'),
    },
    {
        description: `the context targets a missing optional property`,
        resource: vocabularyList.clone({
            nameEnglish: undefined,
        }),
        context: new TextFieldContext({
            target: 'termEnglish',
            charRange: [0, 0],
        }),
        expectedError: new EmptyTargetForTextFieldContextError(vocabularyList, 'termEnglish'),
    },
    {
        description: `the char range's end index is out of range`,
        resource: vocabularyList,
        context: new TextFieldContext({
            target: 'name',
            charRange: [0, 5],
        }),
        expectedError: new InconsistentCharRangeError([0, 5], vocabularyList, 'name'),
    },
];

export default () => ({
    validCases,
    invalidCases,
});
