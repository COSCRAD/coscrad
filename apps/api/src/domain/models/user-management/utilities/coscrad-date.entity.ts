import { InternalError } from '../../../../lib/errors/InternalError';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { Aggregate } from '../../aggregate.entity';

export class CoscradDate extends Aggregate {
    protected validateComplexInvariants(): InternalError[] {
        throw new Error('Method not implemented.');
    }
    getAvailableCommands(): string[] {
        throw new Error('Method not implemented.');
    }
    getName(): MultilingualText {
        throw new Error('Method not implemented.');
    }
    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        throw new Error('Method not implemented.');
    }
}
