import { DiscriminatedBy } from '@coscrad/data-types';
import { EdgeConnectionContext } from '../context.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

@DiscriminatedBy(EdgeConnectionContextType.general)
export class GeneralContext extends EdgeConnectionContext {
    readonly type = EdgeConnectionContextType.general;
}
