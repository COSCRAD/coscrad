import BaseDomainModel from '../../BaseDomainModel';

export default (aggregate: BaseDomainModel): BaseDomainModel => aggregate.clone();
