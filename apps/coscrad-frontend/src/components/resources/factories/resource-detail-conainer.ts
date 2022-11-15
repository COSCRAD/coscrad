import { FunctionalComponent } from '../../../utils/types/functional-component';

type MayHaveId = {
    id?: string;
};

export type ResourceDetailContainer = FunctionalComponent<MayHaveId>;
