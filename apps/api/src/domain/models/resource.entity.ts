import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { EntityId } from '../types/ResourceId';
import { ResourceType } from '../types/resourceTypes';
import BaseDomainModel from './BaseDomainModel';
import { EdgeConnectionContextType } from './context/types/EdgeConnectionContextType';
import { ResourceCompositeIdentifier } from './types/entityCompositeIdentifier';

export abstract class Resource extends BaseDomainModel {
    abstract readonly type: ResourceType;

    readonly id: EntityId;

    abstract readonly allowedContextTypes: EdgeConnectionContextType[];

    // TODO: Rename this 'isPublished' - db migration
    readonly published: boolean;

    constructor(dto: PartialDTO<Resource>) {
        super();

        this.id = dto.id;

        this.published = typeof dto.published === 'boolean' ? dto.published : false;
    }

    getCompositeIdentifier = (): ResourceCompositeIdentifier => ({
        type: this.type,
        id: this.id,
    });

    // protected registerAllowedContextType<TResource extends Resource>(
    //     this: TResource,
    //     contextType: EdgeConnectionContextType
    // ): void {
    //     this.clone<TResource>({
    //         allowedContextTypes: [...new Set(this.allowedContextTypes.concat(contextType))],
    //     } as Partial<TResource>);
    // }
}
