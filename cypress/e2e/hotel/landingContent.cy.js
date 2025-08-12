describe('Landing Page', () => {
  beforeEach(() => {
    // Visit the landing page
    cy.visit('http://localhost:5173/');
  });

  it('should display the correct heading and subheading', () => {
    // Check if the main heading is displayed
    cy.contains('Find your next stay').should('be.visible');

    // Check if the subheading is displayed
    cy.contains('Search deals on hotels, homes, and much more...').should('be.visible');
  });

  it('should display the search bar and allow input', () => {
    // Check if the search bar is visible
    cy.get('input[placeholder="Where to next?"]').should('be.visible');

    // Type into the search bar
    cy.get('input[placeholder="Where to next?"]').type('Singapore');

    // Wait for the dropdown to appear (if necessary)
    cy.wait(500); // Adjust the wait time as needed

    // Click the first matching suggestion
    cy.get('.absolute > :nth-child(1)').first().click();

    // Verify the input value
    cy.get('input[placeholder="Where to next?"]').should('have.value', 'Singapore, Singapore');
  });

  it('should navigate to the search results page on search', () => {
    // Type into the search bar
    cy.get('input[placeholder="Where to next?"]').type('Singapore');

    // Wait for the dropdown to appear (if necessary)
    cy.wait(500); // Adjust the wait time as needed

    // Click the first matching suggestion
    cy.get('.absolute > :nth-child(1)').first().click();
    
    // Click the check in date
    cy.get('input[type="date"]') // Replace with a more specific selector if needed
    .first() // Assuming the first input is for check-in
    .click()
    .type('2025-10-09'); // Type the desired date

    // Verify the input value
    cy.get('input[type="date"]').first().should('have.value', '2025-10-09');

    // Click the check-out date input
    cy.get('input[type="date"]') // Replace with a more specific selector if needed
        .eq(1) // Assuming the second input is for check-out
        .click()
        .type('2025-10-16'); // Type the desired date

    // Verify the input value
    cy.get('input[type="date"]').eq(1).should('have.value', '2025-10-16');

    // Verify the default text for guests and rooms
    cy.contains('2 Guests, 1 Room').should('be.visible');

    cy.get('button') // Adjust the selector to target the specific button
        .contains('Search Hotels') // Ensure it matches the button text
        .click(); // Perform the click action

    // Verify navigation to the search results page
    cy.url().should('include', '/search');
  });
});