import BaseDomainModel from '../BaseDomainModel';

// Can we get away with an interface here?
export abstract class EdgeConnectionContext extends BaseDomainModel {
    abstract readonly type: string;
}
