import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'fs';
import jsdom from 'jsdom';
import MarkdownIt from 'markdown-it';
import path from 'path';

const { JSDOM } = jsdom;

const CHANGELOG_DESTINATION = 'dist/docs';

const STATIC_ASSETS_DIR = 'assets';

// remove the existing build dir
if (existsSync(CHANGELOG_DESTINATION)) {
    rmSync(CHANGELOG_DESTINATION, { recursive: true, force: true });
}

mkdirSync(CHANGELOG_DESTINATION);

const STATIC_ASSETS_DIST_DIR = path.join(CHANGELOG_DESTINATION, STATIC_ASSETS_DIR);

mkdirSync(STATIC_ASSETS_DIST_DIR);

// copy static assets
copyFileSync(
    `scripts/build-changelog/assets/styles.css`,
    path.join(STATIC_ASSETS_DIST_DIR, 'styles.css')
);

const CHANGE_LOG_PATH = 'CHANGELOG.md';

const md = new MarkdownIt();

const markdownDocument = readFileSync(CHANGE_LOG_PATH, 'utf-8');

const BASE_PR_URL = `https://github.com/COSCRAD/coscrad/pull`;

const html = md.render(markdownDocument);

const dom = new JSDOM(html.toString());

var head = dom.window.document.head;
var link = dom.window.document.createElement('link');

link.type = 'text/css';
link.rel = 'stylesheet';
link.href = `${STATIC_ASSETS_DIR}/styles.css`;

head.appendChild(link);

const lis = dom.window.document.querySelectorAll('li');

for (const li of lis) {
    const text = li.textContent;

    if (text.includes('#')) {
        const prNumber = parseInt(text.split('#')[1].slice(0, 3));

        if (Number.isNaN(prNumber)) {
            console.warn(
                `Failed to parse list item with # to get PR link.\n Raw text content: ${text}`
            );
            continue;
        }

        li.innerHTML = `<a href="${BASE_PR_URL}/${prNumber}" target="_blank">${text}</a>`;
    }
}

writeFileSync(path.join(CHANGELOG_DESTINATION, 'index.html'), dom.serialize());
