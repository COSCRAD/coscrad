import { HasId } from './has-id.interface';
import { IMultilingualText } from './resources/common';

export interface IBaseViewModel extends HasId {
    name: IMultilingualText;
}
