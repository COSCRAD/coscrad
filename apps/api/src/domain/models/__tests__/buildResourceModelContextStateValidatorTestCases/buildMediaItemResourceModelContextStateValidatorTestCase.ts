import EmptyTargetForTextFieldContextError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/textFieldContext/EmptyTargetForTextFieldContextError';
import InconsistentCharRangeError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/textFieldContext/InconsistentCharRangeError';
import InconsistentTimeRangeError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/timeRangeContext/InconsistentTimeRangeError';
import { resourceTypes } from '../../../types/resourceTypes';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { TimeRangeContext } from '../../context/time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from '../../context/types/EdgeConnectionContextType';
import {
    ContextStateValidatorTestCase,
    ResourceModelContextStateValidatorInvalidTestCase,
} from '../resourceModelContextStateValidators.spec';
import buildAllInconsistentContextTypeTestCases from '../utilities/buildAllInconsistentContextTypeTestCases';
import buildAllValidTestCasesForResource from '../utilities/buildAllValidTestCasesForResource';

const validCases = buildAllValidTestCasesForResource(resourceTypes.mediaItem);
const inconsistentContextTypeTestCases = buildAllInconsistentContextTypeTestCases(
    resourceTypes.mediaItem
);
const validMediaItem = validCases[0].resource;

const mediaItemWithNoTitle = validMediaItem.clone({
    title: undefined,
});

const invalidTimeRangeContext = new TimeRangeContext({
    type: EdgeConnectionContextType.timeRange,
    timeRange: {
        inPoint: 0,
        outPoint: validMediaItem.lengthMilliseconds + 500,
    },
});

const invalidCases: ResourceModelContextStateValidatorInvalidTestCase[] = [
    ...(inconsistentContextTypeTestCases as unknown as ResourceModelContextStateValidatorInvalidTestCase[]),
    {
        description: `the target property is undefined`,
        resource: mediaItemWithNoTitle,
        context: new TextFieldContext({
            type: EdgeConnectionContextType.textField,
            target: 'title',
            charRange: [0, 2],
        }),
        expectedError: new EmptyTargetForTextFieldContextError(mediaItemWithNoTitle, 'title'),
    },
    {
        description: `the text field context targets a last char index that is too big`,
        resource: validMediaItem,
        context: new TextFieldContext({
            type: EdgeConnectionContextType.textField,
            target: 'title',
            charRange: [0, validMediaItem.title.length + 5],
        }),
        expectedError: new InconsistentCharRangeError(
            [0, validMediaItem.title.length + 5],
            validMediaItem,
            'title'
        ),
    },
    {
        description: 'the time range context targets an end point that is too big',
        resource: validMediaItem,
        context: invalidTimeRangeContext,
        expectedError: new InconsistentTimeRangeError(
            invalidTimeRangeContext.timeRange,
            validMediaItem
        ),
    },
];

export default (): ContextStateValidatorTestCase => ({
    validCases,
    invalidCases,
});
