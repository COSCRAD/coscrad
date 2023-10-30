/**
 * We re-export this here to minimize file-system coupling with the domain.
 * We may want to break out the view layer into a lib at some point, although there's also
 * the possibility of instead breaking out the `vertical slices`.
 */
export * from './base-event';
