import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { AggregateId } from '../../../../types/AggregateId';

export type FSAFactoryFunction = (id: AggregateId) => CommandFSA;
