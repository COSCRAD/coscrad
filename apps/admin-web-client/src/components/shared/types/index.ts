export interface CommandResponse {
    type: string;
    id: string;
    revision: string;
}

export interface CommandFsa {
    type: string;
    payload: unknown;
}
