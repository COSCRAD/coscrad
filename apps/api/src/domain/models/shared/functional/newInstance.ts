import { Ctor } from '../../../../lib/types/Ctor';
import { DTO } from '../../../../types/DTO';

export default <TInstance>(ClassConstructor: Ctor<TInstance>) =>
    (dto: DTO<TInstance>) =>
        new ClassConstructor(dto);
