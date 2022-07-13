import { IUserRepository } from './user-repository.interface';

export interface IUserRepositoryProvider {
    getUserRepository: () => IUserRepository;
}
