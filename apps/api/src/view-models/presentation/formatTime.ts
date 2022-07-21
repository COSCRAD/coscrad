/**
 * TODO Consider using date \ time formatter library if you need more than this
 */
export default (timeMilliseconds: number): string => `${timeMilliseconds / 1000} s`;
