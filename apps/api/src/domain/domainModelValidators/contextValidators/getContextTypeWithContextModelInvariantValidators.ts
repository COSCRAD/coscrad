import { EdgeConnectionContextType } from '../../models/context/types/EdgeConnectionContextType';
import { pointContextValidator } from './pointContext.validator';
import { textFieldContextValidator } from './textFieldContext.validator';
import { timeRangeContextValidator } from './timeRangeContext.validator';

/**
 * TODO Let's remove this in favor of implementing `validateInvariants` and \ or
 * `validateComplexInvariants` on the context classes and calling this polymorphically.
 */
export default () =>
    [
        // [EdgeConnectionContextType.freeMultiline, freeMultilineContextValidator],
        // [EdgeConnectionContextType.pageRange, pageRangeContextValidator],
        [EdgeConnectionContextType.point2D, pointContextValidator],
        [EdgeConnectionContextType.textField, textFieldContextValidator],
        [EdgeConnectionContextType.timeRange, timeRangeContextValidator],
    ] as const;
