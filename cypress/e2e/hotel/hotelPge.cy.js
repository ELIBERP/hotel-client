describe('Feature 3 - E2E', () => {
  const destinationId = 'RsBU';
  const params = [
    `destination_id=${destinationId}`,
    'checkin=2025-08-26',
    'checkout=2025-08-29',
    'lang=en_US',
    'currency=SGD',
    'guests=2',
    'partner_id=1089',
    'landing_page=wl-acme-earn',
    'product_type=earn'
  ].join('&');

  beforeEach(() => {
    cy.intercept('GET', `**/hotels?destination_id=${destinationId}`).as('hotels');
    cy.intercept(
      'GET',
      `**/hotels/prices?destination_id=${destinationId}&checkin=2025-08-26&checkout=2025-08-29&lang=en_US&currency=SGD&guests=2&partner_id=1089&landing_page=wl-acme-earn&product_type=earn`
    ).as('prices');

    cy.visit(`http://localhost:5173/search?${params}`);

    cy.wait(['@hotels', '@prices']); // Wait for both requests to complete
  });

  it('filter button is on screen', () => {
    cy.get('.text-xl')
      .should('be.visible')
      .contains('Filters');
  });

  it('goes to feature 3 when "Select" button is clicked', () => {
    cy.get('[href="/hotels/48Pm?destination_id=RsBU&checkin=2025-08-26&checkout=2025-08-29&lang=en_US&currency=SGD&guests=2&partner_id=1089&landing_page=wl-acme-earn&product_type=earn"] > .p-6 > .items-end > .mt-4')
      .click();

    cy.url().should('include', '/hotels/48Pm');
  });
});