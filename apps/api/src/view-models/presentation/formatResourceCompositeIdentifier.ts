import { ResourceCompositeIdentifier } from '../../domain/models/types/entityCompositeIdentifier';

export default ({ id, type }: ResourceCompositeIdentifier): string => `${type}/${id}`;
