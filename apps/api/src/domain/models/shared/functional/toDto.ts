import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../BaseDomainModel';

export default <T extends BaseDomainModel>(model: T): DTO<T> => model.toDTO();
