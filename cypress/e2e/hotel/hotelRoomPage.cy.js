describe('Feature 3 - E2E', () => {
  // Use provided hotel ID and query params
  const hotelId = 'dwHs';
  const params = [
    'destination_id=dwHs',
    'checkin=2025-08-21',
    'checkout=2025-08-25',
    'lang=en_US',
    'currency=SGD',
    'guests=2',
    'partner_id=1089',
    'landing_page=wl-acme-earn',
    'product_type=earn'
  ].join('&');

  beforeEach(() => {
    cy.visit(`http://localhost:5173/hotels/${hotelId}?${params}`);
    
    cy.intercept('GET', '**/hotels/*').as('hotel');
    cy.intercept('GET', '**/hotels/*/prices*').as('prices');

    // cy.visit('http://localhost:5173/hotels/48Pm?destination_id=RsBU&checkin=2025-08-26&checkout=2025-08-29&lang=en_US&currency=SGD&guests=2&partner_id=1089&landing_page=wl-acme-earn&product_type=earn');

    cy.wait(['@hotel', '@prices']); // replaces cy.wait(10000)  });
  });

  it('shows description modal when "View more details..." button is clicked', () => {
    // Wait for the "View more details..." button to appear and click it
    cy.contains('button', 'View more details...')
      .should('be.visible')
      .click();

    // Modal should appear with "Full Description" heading
    cy.contains('h2', 'Full Description').should('be.visible');

    // Modal should contain some description text
    cy.get('p.text-sm.text-\\[\\#0e151b\\].leading-relaxed.whitespace-pre-line');

    // Close the modal
    cy.contains('button', 'Close').click();

    // Modal should disappear
    cy.contains('Full Description').should('not.exist');
  });

  it('views room details and clicks book now', () => {
    // Price API takes awhile to respond
    // cy.wait(10000);

    // Click the "View Room Details" button
    cy.get('.p-4 > .px-4')
      .click();

    // Check if the "Breakfast: Not included" paragraph is visible inside the modal/container
    cy.contains('p', 'Breakfast: Not included').should('be.visible');

    // Find and click the "Book Now" button
    cy.contains('button', 'Book Now')
      .should('be.visible')
      .click();

    // Add an assertion here to confirm the action, e.g., URL change or a new element appearing
    // cy.url().should('include', 'booking-confirmation');
  });
});