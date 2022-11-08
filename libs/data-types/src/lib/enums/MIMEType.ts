import { isEnum } from '@coscrad/validation';

// We may want to exclude this lib from actually knowing the enums
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { MIMEType } from '@coscrad/api-interfaces';

export { MIMEType };

export const isMIMEType = (input: unknown): input is MIMEType => isEnum(input, MIMEType);
