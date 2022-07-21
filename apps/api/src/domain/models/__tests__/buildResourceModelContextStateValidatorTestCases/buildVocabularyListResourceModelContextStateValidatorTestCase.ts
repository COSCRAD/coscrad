import EmptyTargetForTextFieldContextError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/textFieldContext/EmptyTargetForTextFieldContextError';
import InconsistentCharRangeError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/textFieldContext/InconsistentCharRangeError';
import { ResourceType } from '../../../types/ResourceType';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { EdgeConnectionContextType } from '../../context/types/EdgeConnectionContextType';
import { ResourceModelContextStateValidatorInvalidTestCase } from '../resourceModelContextStateValidators.spec';
import buildAllInvalidTestCasesForResource from '../utilities/buildAllInconsistentContextTypeTestCases';
import buildAllValidTestCasesForResource from '../utilities/buildAllValidTestCasesForResource';

const validCases = buildAllValidTestCasesForResource(ResourceType.vocabularyList);

const vocabularyList = validCases[0].resource.clone({
    name: 'foo',
});

const invalidCases: ResourceModelContextStateValidatorInvalidTestCase[] = [
    ...buildAllInvalidTestCasesForResource(ResourceType.vocabularyList),
    {
        description: `vocabulary list does not have the property targetted in the text field context`,
        resource: vocabularyList,
        context: new TextFieldContext({
            type: EdgeConnectionContextType.textField,
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
            type: EdgeConnectionContextType.textField,
            target: 'termEnglish',
            charRange: [0, 0],
        }),
        expectedError: new EmptyTargetForTextFieldContextError(vocabularyList, 'termEnglish'),
    },
    {
        description: `the char range's end index is out of range`,
        resource: vocabularyList,
        context: new TextFieldContext({
            type: EdgeConnectionContextType.textField,
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
