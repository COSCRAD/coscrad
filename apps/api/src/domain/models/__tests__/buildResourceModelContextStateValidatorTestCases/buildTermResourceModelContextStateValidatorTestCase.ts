import EmptyTargetForTextFieldContextError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/textFieldContext/EmptyTargetForTextFieldContextError';
import InconsistentCharRangeError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/textFieldContext/InconsistentCharRangeError';
import { ResourceType } from '../../../types/ResourceType';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { EdgeConnectionContextType } from '../../context/types/EdgeConnectionContextType';
import { ResourceModelContextStateValidatorInvalidTestCase } from '../resourceModelContextStateValidators.spec';
import buildAllInvalidTestCasesForResource from '../utilities/buildAllInconsistentContextTypeTestCases';
import buildAllValidTestCasesForResource from '../utilities/buildAllValidTestCasesForResource';

const validCases = buildAllValidTestCasesForResource(ResourceType.term);

const validTerm = validCases[0].resource.clone({
    term: 'foobar',
});

const termMissingTermProperty = validTerm.clone({
    term: undefined,
    termEnglish: 'foo',
});

const termMissingTermEnglishProperty = validTerm.clone({
    termEnglish: undefined,
    term: 'foo',
});

const invalidCases: ResourceModelContextStateValidatorInvalidTestCase[] = [
    ...buildAllInvalidTestCasesForResource(ResourceType.term),
    {
        description: 'when the context targets an undefined "term" field',
        resource: termMissingTermProperty,
        context: new TextFieldContext({
            type: EdgeConnectionContextType.textField,
            target: 'term',
            charRange: [0, 1],
        }),
        expectedError: new EmptyTargetForTextFieldContextError(
            termMissingTermProperty.getCompositeIdentifier(),
            'term'
        ),
    },
    {
        description: 'when the context targets an undefined "termEnglish" field',
        resource: termMissingTermEnglishProperty,
        context: new TextFieldContext({
            type: EdgeConnectionContextType.textField,
            target: 'termEnglish',
            charRange: [0, 1],
        }),
        expectedError: new EmptyTargetForTextFieldContextError(
            termMissingTermProperty.getCompositeIdentifier(),
            'termEnglish'
        ),
    },
    {
        description: 'text field context targets an out of range character',
        resource: validTerm,
        context: new TextFieldContext({
            type: EdgeConnectionContextType.textField,
            target: 'term',
            charRange: [0, validTerm.term.length],
        }),
        expectedError: new InconsistentCharRangeError(
            [0, validTerm.term.length],
            validTerm,
            'term'
        ),
    },
];

export default () => ({
    validCases,
    invalidCases,
});
