import { AggregateType } from '@coscrad/api-interfaces';
import { InternalError } from '../../../lib/errors/InternalError';
import { MultilingualText } from '../../common/entities/multilingual-text';
import { AggregateRoot } from '../../decorators';
import { AggregateCompositeIdentifier } from '../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../types/AggregateId';
import { Aggregate } from '../aggregate.entity';

@AggregateRoot(AggregateType.map)
export class GeospatialMap extends Aggregate {
    name: MultilingualText;

    description: MultilingualText;

    points: AggregateId[];

    protected validateComplexInvariants(): InternalError[] {
        throw new Error('Method not implemented.');
    }

    getAvailableCommands(): string[] {
        throw new Error('Method not implemented.');
    }

    getName(): MultilingualText {
        throw new Error('Method not implemented.');
    }

    protected getExternalReferences(): AggregateCompositeIdentifier<AggregateType>[] {
        throw new Error('Method not implemented.');
    }

    fromMapCreated() {
        throw new Error('not implemented');
    }
}
