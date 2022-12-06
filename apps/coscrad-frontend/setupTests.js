// Polyfill "window.fetch" in Jest runtime
import 'whatwg-fetch';

var createElementNSOrig = global.document.createElementNS;
global.document.createElementNS = function (namespaceURI, qualifiedName) {
    if (namespaceURI === 'http://www.w3.org/2000/svg' && qualifiedName === 'svg') {
        var element = createElementNSOrig.apply(this, arguments);
        /* eslint-disable */
        element.createSVGRect = function () {};
        return element;
    }
    return createElementNSOrig.apply(this, arguments);
};
