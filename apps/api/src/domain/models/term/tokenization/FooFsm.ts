// import { isNonEmptyObject } from '@coscrad/validation-constraints';
// import { InternalError } from 'apps/api/src/lib/errors/InternalError';

import assert = require('node:assert');
import { InternalError } from '../../../../lib/errors/InternalError';

class Node {
    text: string;

    transitions: Map<string, Node> = new Map();

    isLetter: boolean;

    constructor(text: string, isLetter = true) {
        this.text = text;

        this.isLetter = isLetter;
    }

    registerTransition(keystroke: string, newNode: Node): this {
        if (this.transitions.has(keystroke)) {
            throw new InternalError(
                `keystroke: ${keystroke} cannot transition to ${
                    newNode.text
                }, as it already transtions to: ${this.transitions.get(keystroke).text}`
            );
        }

        this.transitions.set(keystroke, newNode);

        return this;
    }

    size(): number {
        if (this.transitions.size === 0) {
            return 1;
        }

        return [...this.transitions.values()].reduce(
            (count, nextNode) => count + nextNode.size(),
            0
        );
    }
}

('’ɨʔŝẑŵ');

const isolatedLetters = 'aeiɨuobpmnjszwŝẑŵʔ'.split('');

export class AlphabetFiniteStateMachine {
    private root: Node = new Node(null);

    constructor() {
        // 4 from d
        const d = new Node('d');

        d.registerTransition('z', new Node('dz'))
            .registerTransition('ẑ', new Node('dẑ'))
            .registerTransition('l', new Node('dl'));

        this.root.registerTransition('d', d);

        // 7 from t
        const t = new Node('t')
            .registerTransition('’', new Node('t’'))
            .registerTransition('s', new Node('ts').registerTransition('’', new Node('ts’')))
            .registerTransition('ŝ', new Node('tŝ').registerTransition('’', new Node('tŝ’')))
            .registerTransition('l', new Node('tl'));

        this.root.registerTransition('t', t);

        // 4 from k
        const k = new Node('k')
            .registerTransition('w', new Node('kw').registerTransition('’', new Node('kw’')))
            .registerTransition('’', new Node('k’'));

        this.root.registerTransition('k', k);

        // 5 from g
        const g = new Node('g')
            .registerTransition('w', new Node('gw'))
            .registerTransition('g', new Node('gg').registerTransition('w', new Node('ggw')))
            .registerTransition('h', new Node('gh'));

        this.root.registerTransition('g', g);

        // 2 from l
        const l = new Node('l').registerTransition('h', new Node('lh'));

        this.root.registerTransition('l', l);

        // 2 from x
        const x = new Node('x').registerTransition('w', new Node('xw'));

        this.root.registerTransition('x', x);

        // 2 from s
        const s = new Node('s').registerTransition('h', new Node('sh'));

        this.root.registerTransition('s', s);

        // 2 from w
        const w = new Node('w').registerTransition('h', new Node('wh'));

        this.root.registerTransition('w', w);

        // 2 from c (c doesn't count!)
        const c = new Node('c', false).registerTransition(
            'h',
            new Node('ch').registerTransition('’', new Node('ch’'))
        );

        this.root.registerTransition('c', c);

        // 18 isolated letters that have no valid transitions
        isolatedLetters.forEach((l) => this.root.registerTransition(l, new Node(l)));

        assert(this.size() == 53);
    }

    size(): number {
        return this.root.size();
    }
}
