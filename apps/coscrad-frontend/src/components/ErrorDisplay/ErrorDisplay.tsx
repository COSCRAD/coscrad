import { IHttpErrorInfo } from '@coscrad/api-interfaces';

export const ErrorDisplay = (errorInfo: IHttpErrorInfo) => (
    <div>
        Encountered an error boundary. Please screenshot and share this with your COSCRAD system
        admin.
        {/* We should create a better presentation of this info. */}
        {JSON.stringify(errorInfo)}
    </div>
);
