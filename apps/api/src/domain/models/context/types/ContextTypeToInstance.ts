import { FreeMultilineContext } from '../free-multiline-context/free-multiline-context.entity';
import { GeneralContext } from '../general-context/general-context.entity';
import { IdentityContext } from '../identity-context.entity/identity-context.entity';
import { PageRangeContext } from '../page-range-context/page-range.context.entity';
import { PointContext } from '../point-context/point-context.entity';
import { TextFieldContext } from '../text-field-context/text-field-context.entity';
import { TimeRangeContext } from '../time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from './EdgeConnectionContextType';

// TODO type safety
export type ContextTypeToInstance = {
    [EdgeConnectionContextType.freeMultiline]: FreeMultilineContext;
    [EdgeConnectionContextType.pageRange]: PageRangeContext;
    [EdgeConnectionContextType.point2D]: PointContext;
    [EdgeConnectionContextType.textField]: TextFieldContext;
    [EdgeConnectionContextType.timeRange]: TimeRangeContext;
    [EdgeConnectionContextType.general]: GeneralContext;
    [EdgeConnectionContextType.identity]: IdentityContext;
};
