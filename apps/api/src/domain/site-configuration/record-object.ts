type RecordType = Record<string, string>;

export class RecordObject implements RecordType {
    [key: string]: string;

    value: string;
}
