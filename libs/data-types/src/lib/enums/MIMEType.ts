import { isEnum } from '@coscrad/validation';

/**
 * // TODO[https://www.pivotaltracker.com/story/show/183765745]
 * We may want to exclude this lib from actually knowing the enum.
 */
//  eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { MIMEType } from '@coscrad/api-interfaces';

export { MIMEType };

export const isMIMEType = (input: unknown): input is MIMEType => isEnum(input, MIMEType);
