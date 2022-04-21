import { EdgeConnectionContext } from '../context.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

export class GeneralContext extends EdgeConnectionContext {
    readonly type = EdgeConnectionContextType.general;
}
