import { GeneralContext } from '../general-context/general-context.entity';
import { PageRangeContext } from '../page-range-context/page-range.context.entity';
import { PointContext } from '../point-context/point-context.entity';
import { TextFieldContext } from '../text-field-context/text-field-context.entity';
import { TimeRangeContext } from '../time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from './EdgeConnectionContextType';

export type ContextTypeToInstance = {
    [EdgeConnectionContextType.freeMultiline]: PageRangeContext;
    [EdgeConnectionContextType.pageRange]: PageRangeContext;
    [EdgeConnectionContextType.point2D]: PointContext;
    [EdgeConnectionContextType.textField]: TextFieldContext;
    [EdgeConnectionContextType.timeRange]: TimeRangeContext;
    [EdgeConnectionContextType.general]: GeneralContext;
};
