import { Resource } from '../../../../../../models/resource.entity';

export type GetValidInstanceForSubtype<T extends Resource> = (subtype: string) => T;
