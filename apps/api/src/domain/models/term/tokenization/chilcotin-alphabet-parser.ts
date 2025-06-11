import assert = require('node:assert');
import { InternalError } from '../../../../lib/errors/InternalError';
import { AlphabetCharacters } from './tokenizer.interface';

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
                `keystroke: ${keystroke} cannot cause ${this.text} to transition to ${
                    newNode.text
                }, as it already transtions to: ${this.transitions.get(keystroke).text}`
            );
        }

        this.transitions.set(keystroke, newNode);

        return this;
    }

    size(): number {
        return (
            this.transitions.size +
            [...this.transitions.values()].reduce((count, nextNode) => count + nextNode.size(), 0)
        );
    }

    toList(list?: string[], seenNodes?: Set<Node>): string[] {
        if (!list) {
            list = [];
        }

        if (!seenNodes) {
            seenNodes = new Set<Node>();
        }

        if (this.text !== null && this.isLetter) {
            list.push(this.text);
        }

        for (const childNode of this.transitions.values()) {
            /**
             * Note that there are multiple paths to some nodes due to the possibility
             * of entering a plain consonant followed by a lone surrogate (e.g. "s" + cap).
             * We are comparing by reference not value here. We **do not** want to
             * hide the fact that there are multiple nodes with the same symbol,
             * a state which breaks the uniqueness invariant checked below.
             */
            if (!seenNodes.has(childNode)) {
                seenNodes.add(childNode);
                childNode.toList(list, seenNodes);
            }
        }

        return list;
    }

    hasTransition(keystroke: string): boolean {
        return this.transitions.has(keystroke);
    }

    transition(keystroke: string): Node {
        if (!this.hasTransition(keystroke)) {
            throw new InternalError(
                `No transition found for keystroke: ${keystroke}. Did you forget to check "hasTransition(${keystroke}) before calling transition(${keystroke})?" `
            );
        }

        return this.transitions.get(keystroke);
    }
}

const isolatedLetters = 'aeiɨuobpmnjhyʔ'.split('');

export class ChilcotinAlphabetParser {
    // we are flagging that the root is not a letter
    private root: Node = new Node(null, false);

    private punctuation: Set<string>;

    constructor(punctuationNativeCharacterss: string[] = `"?.!-,`.split('')) {
        this.punctuation = new Set(punctuationNativeCharacterss);

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
            .registerTransition('l', new Node('tl').registerTransition('’', new Node('tl’')));

        this.root.registerTransition('t', t);

        // 4 from k
        const k = new Node('k')
            .registerTransition('w', new Node('kw').registerTransition('’', new Node('kw’')))
            .registerTransition('’', new Node('k’'));

        this.root.registerTransition('k', k);

        // 4 from q
        const q = new Node('q')
            .registerTransition('w', new Node('qw').registerTransition('’', new Node('qw’')))
            .registerTransition('’', new Node('q’'));

        this.root.registerTransition('q', q);

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

        // 3 from s
        const s = new Node('s').registerTransition('h', new Node('sh'));

        const sCapCharacter = String.fromCharCode(0x015d);

        const sCap = new Node(sCapCharacter);

        this.root.registerTransition(sCapCharacter, sCap);

        /**
         * This is unfortunate, but sometimes the cap comes through as an
         * independent character, and sometimes the capped letters come through
         * as atomic letters.
         */
        s.registerTransition('̂', sCap);

        this.root.registerTransition('s', s);

        // 2 from w
        const w = new Node('w').registerTransition('h', new Node('wh'));

        const wCapChar = String.fromCharCode(0x0175);

        // see note for 'ŝ'
        const wCap = new Node(wCapChar);

        // enter w + cap (lone surrogate)
        w.registerTransition('̂', wCap);

        this.root.registerTransition('w', w);

        // enter the entire unicode character atomically
        this.root.registerTransition(wCapChar, wCap);

        // 2 from z
        const z = new Node('z');

        const zCapChar = String.fromCharCode(0x1e91);

        const zCap = new Node(zCapChar);

        // z + cap (lone surrogate)
        z.registerTransition('̂', zCap);

        // enter 'ẑ' atomically as one character
        this.root.registerTransition(zCapChar, zCap);

        this.root.registerTransition('z', z);

        // 2 from c (c doesn't count, as it isn't a valid letter on its own)
        const c = new Node('c', false).registerTransition(
            'h',
            new Node('ch').registerTransition('’', new Node('ch’'))
        );

        this.root.registerTransition('c', c);

        // 18 isolated letters that have no valid transitions
        isolatedLetters.forEach((l) => this.root.registerTransition(l, new Node(l)));

        const letters = this.root.toList();

        const uniqueLetters = Array.from(new Set(letters));

        // check for duplicates
        // note that we include caps as well
        assert(
            letters.length === uniqueLetters.length,
            `Duplicate letters found in alphabet: ${letters.join(', ')}`
        );

        const NUMBER_OF_LETTERS_IN_ALPHABET = 53;

        /**
         * We have to include the cap as an independent symbol as in some
         * cases this is how it comes through.
         */
        const actualSize = uniqueLetters.length;

        assert(actualSize === NUMBER_OF_LETTERS_IN_ALPHABET);
    }

    size(): number {
        const letters = this.root.toList();

        return letters.length;
    }

    listAll(): string[] {
        return this.root.toList();
    }

    parse(input: string): AlphabetCharacters[] {
        if (input.length === 0) {
            return [];
        }

        let current: Node = this.root;
        let charIndex = 0;

        const letters: AlphabetCharacters[] = [];

        // for each latin letter input
        while (charIndex < input.length) {
            const keystroke = input.charAt(charIndex);

            if (current.hasTransition(keystroke)) {
                current = current.transition(keystroke);
                charIndex++;
                continue;
            }

            // we can't take the next keystroke
            // do we have a valid letter?
            if (current.isLetter) {
                letters.push({
                    text: current.text,
                    isOutOfAlphabet: false,
                    isPunctuationOrWhiteSpace: false,
                });

                // reset
                current = this.root;
                // we do not increment `charIndex` at this point
                continue;
            }

            // do we have punctuation?
            if (this.punctuation.has(keystroke)) {
                letters.push({
                    text: keystroke,
                    isOutOfAlphabet: true,
                    isPunctuationOrWhiteSpace: true,
                });

                current = this.root;
                // we have pushed the out-of-alphabet NativeCharacters, we are ready for the next one
                charIndex++;
                continue;
            }

            // do we have an exceptional char?
            letters.push({
                text: keystroke,
                isOutOfAlphabet: true,
                isPunctuationOrWhiteSpace: false,
            });

            current = this.root;
            // we have pushed the out-of-alphabet NativeCharacters, we are ready for the next one
            charIndex++;
        }

        // is there a better way to resolve the last result?
        if (current.isLetter) {
            letters.push({
                text: current.text,
                isOutOfAlphabet: false,
                isPunctuationOrWhiteSpace: false,
            });
        } else if (!this.punctuation.has(input.charAt(charIndex - 1))) {
            const lastChar = input.charAt(charIndex - 1);

            letters.push({
                text: lastChar,
                isOutOfAlphabet: true,
                isPunctuationOrWhiteSpace: false,
            });
        }

        return letters;
    }
}
