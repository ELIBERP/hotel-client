describe('HotelDetails - Map Modal', () => {
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
  });

  it('shows map modal when address button is clicked', () => {
    // Wait for hotel address button to appear
    cy.contains('button', /^📍 /)
      .should('be.visible')
      .click();

    // Modal should appear with "Hotel Location" heading
    cy.contains('h2', 'Hotel Location').should('be.visible');

    // Map should be rendered (look for the Map container)
    cy.get('.rounded-xl').find('iframe, div').should('exist');

    // Close the modal
    cy.contains('button', 'Close').click();

    // Modal should disappear
    cy.contains('Hotel Location').should('not.exist');
  });

  it('shows description modal when "View more details..." button is clicked', () => {
    // Wait for the "View more details..." button to appear and click it
    cy.contains('button', 'View more details...')
      .should('be.visible')
      .click();

    // Modal should appear with "Full Description" heading
    cy.contains('h2', 'Full Description').should('be.visible');

    // Modal should contain some description text
    cy.get('.text-sm text-[#0e151b] leading-relaxed whitespace-pre-line').should('be.visible');

    // Close the modal
    cy.contains('button', 'Close').click();

    // Modal should disappear
    cy.contains('Full Description').should('not.exist');
  });
});