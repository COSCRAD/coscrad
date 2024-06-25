import BaseDomainModel from '../../base-domain-model.entity';

export default (aggregate: BaseDomainModel): BaseDomainModel => aggregate.clone();
