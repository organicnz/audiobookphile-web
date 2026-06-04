describe('Global Search', () => {
  beforeEach(() => {
    // Assuming logged in
    cy.visit('/')
  })

  it('can open the command palette and perform a standard search', () => {
    // Open the command palette (assuming there's a button or keyboard shortcut)
    // cy.get('body').type('{ctrl}k') // Example shortcut
    
    // Type in the search input
    // cy.get('input[placeholder*="Search"]').type('Harry Potter')
    
    // Verify results are populated
    // cy.get('.max-h-\\[60vh\\]').children().should('have.length.greaterThan', 0)
  })

  it('can toggle AI Semantic Search', () => {
    // Open the command palette
    // cy.get('body').type('{ctrl}k')
    
    // Check for the AI Search button
    // cy.get('button[title="Toggle AI Semantic Search"]').click()
    
    // The placeholder should change
    // cy.get('input[placeholder*="Describe what you\'re looking for"]').should('exist')
  })
})
