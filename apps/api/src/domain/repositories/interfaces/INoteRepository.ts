import { Note } from '../../models/note/entities/note.entity';
import { IRepositoryForEntity } from './repository-for-entity';

// Will the Repo interface differ at all for Notes?
export type INoteRepository = IRepositoryForEntity<Note>;
