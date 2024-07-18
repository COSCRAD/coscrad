import { Observable, Subject } from 'rxjs';

/**
 * This implementation is taken verbatim from `@nestjs/cqrs`
 * `https://github.com/nestjs/cqrs/blob/master/src/utils/observable-bus.ts`.
 *
 * We do not need the full complexity of their implementation, and we want
 * to remain flexible to moving to an out-of-process messaging queue, so
 * most of the rest of the pattern is implemented from scratch.
 */
export class ObservableBus<T> extends Observable<T> {
    protected _subject$ = new Subject<T>();

    constructor() {
        super();
        this.source = this._subject$;
    }

    public get subject$() {
        return this._subject$;
    }
}
