import BaseDomainModel from '../BaseDomainModel';
import { EdgeConnectionContextType } from './types/EdgeConnectionContextType';

export abstract class EdgeConnectionContext extends BaseDomainModel {
    abstract readonly type: EdgeConnectionContextType;
}
