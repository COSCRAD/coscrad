import { HttpStatusCode } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';

export interface ApiErrorResponse {
    error: {
        status: HttpStatusCode;
        data: string;
    };
    isUnhandledError: boolean;
    meta: {
        request: Record<string, unknown>;
        response: Record<string, unknown>;
    };
}

// Type for the parsed internal JSON data string
export interface InnerCommandError {
    error: string; // "Command execution error.\nInner Errors: Command execution error."
}

export const transformApiError = (err: ApiErrorResponse) => {
    if (!isNullOrUndefined(err.error.data)) {
        const innerData: InnerCommandError = JSON.parse(err.error.data);

        return `${err.error.status} - ${innerData.error}`;
    } else {
        return `${JSON.stringify(err.error).substring(0, 255)}...`;
    }
};
