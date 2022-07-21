import { EdgeConnectionContextType } from '../../models/context/types/EdgeConnectionContextType';
import { freeMultilineContextValidator } from './freeMultilineContext.validator';
import { pageRangeContextValidator } from './pageRangeContext.validator';
import { pointContextValidator } from './pointContext.validator';
import { textFieldContextValidator } from './textFieldContext.validator';
import { timeRangeContextValidator } from './timeRangeContext.validator';

export default () =>
    [
        [EdgeConnectionContextType.freeMultiline, freeMultilineContextValidator],
        [EdgeConnectionContextType.pageRange, pageRangeContextValidator],
        [EdgeConnectionContextType.point2D, pointContextValidator],
        [EdgeConnectionContextType.textField, textFieldContextValidator],
        [EdgeConnectionContextType.timeRange, timeRangeContextValidator],
    ] as const;
