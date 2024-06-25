import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../base-domain-model.entity';

export default <T extends BaseDomainModel>(model: T): DTO<T> => model.toDTO();
