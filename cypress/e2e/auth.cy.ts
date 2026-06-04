describe('Authentication Flow', () => {
  beforeEach(() => {
    // Navigate to the app root
    cy.visit('/')
  })

  it('redirects unauthenticated users to the login page', () => {
    // Wait for the redirect to happen
    cy.url().should('include', '/login')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
  })

  it('allows a user to log in and redirects to the home page', () => {
    cy.visit('/login')
    
    // Fill out the login form
    // Assuming you have a test user in your local database
    cy.get('input[type="email"]').type('test@audiobookshelf.test')
    cy.get('input[type="password"]').type('testpassword123')
    
    // Submit
    cy.get('button[type="submit"]').click()
    
    // Should be redirected to home or library
    cy.url().should('not.include', '/login')
    
    // Check if a common UI element of the authenticated state is visible
    cy.get('header').should('be.visible')
  })
})
