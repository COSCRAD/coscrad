import { Entity } from '../../models/entity';
import { IRepositoryForEntity } from './repository-for-entity';

// TODO [https://www.pivotaltracker.com/story/show/181777471] Add Note model
type Note = Entity;

// Will the Repo interface differ at all for Notes?
export type INoteRepository = IRepositoryForEntity<Note>;
