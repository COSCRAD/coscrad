import { DomainModelCtor } from './DomainModelCtor';

export type CtorToInstance<T> = T extends DomainModelCtor<infer U> ? U : never;
