import { HasId } from './has-id.interface';
import { IMultilingualText } from './resources';

export interface IBaseViewModel extends HasId {
    name: IMultilingualText;
}
