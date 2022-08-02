import { FreeMultilineContext } from '../free-multiline-context/free-multiline-context.entity';
import { GeneralContext } from '../general-context/general-context.entity';
import { IdentityContext } from '../identity-context.entity/identity-context.entity';
import { PageRangeContext } from '../page-range-context/page-range.context.entity';
import { PointContext } from '../point-context/point-context.entity';
import { TextFieldContext } from '../text-field-context/text-field-context.entity';
import { TimeRangeContext } from '../time-range-context/time-range-context.entity';

/**
 * TODO [design] Can we avoid this union? It's nevefr going to be
 * extensible. Can't we program to the base interface instead of the union?
 */
export type ContextModelUnion =
    | FreeMultilineContext
    | PageRangeContext
    | PointContext
    | TextFieldContext
    | TimeRangeContext
    | GeneralContext
    | IdentityContext;
