import { ResourceCompositeIdentifier } from '../../domain/types/ResourceCompositeIdentifier';

export default ({ id, type }: ResourceCompositeIdentifier): string => `${type}/${id}`;
