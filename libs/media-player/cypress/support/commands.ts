/// <reference types="cypress" />
import { mount } from 'cypress/react18';

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        interface Chainable<Subject> {
            login(email: string, password: string): void;
            mount: typeof mount;

            getByDataAttribute(value: string, attributeSuffix?: string): Chainable<Subject>;
        }
    }
}

Cypress.Commands.add('mount', mount);

//
// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
    console.log('Custom command example: Login', email, password);
});

Cypress.Commands.add('getByDataAttribute', (value: string, attributeSuffix = 'testid') => {
    cy.get(`[data-${attributeSuffix}="${value}"]`);
});
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
