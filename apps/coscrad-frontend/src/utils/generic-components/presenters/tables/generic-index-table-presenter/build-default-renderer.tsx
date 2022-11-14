import { IBaseViewModel } from '@coscrad/api-interfaces';

export const buildDefaultRenderer =
    <T extends IBaseViewModel>(propertyKey: keyof T) =>
    (input: T) =>
        <div>{(JSON.stringify(input[propertyKey]) || '').replace(/"/g, '')}</div>;
