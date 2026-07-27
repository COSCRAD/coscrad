export const buildDefaultRenderer =
    <T,>(propertyKey: keyof T) =>
    (input: T) =>
        <>{(JSON.stringify(input[propertyKey]) || '').replace(/"/g, '')}</>;
