/// <reference types="Cypress" />


//test data here
let addresses = [
  {
    home: "San Francisco, CA, USA",
    work: "VMware Hilltop B, Hillview Avenue, Palo Alto, CA, USA"
  },
  {
    home: "Princeton, NJ, USA",
    work: "New York, NY, USA"
  },
  {
    home: "Grays Point NSW, Australia",
    work: "175 Pitt Street,Sydney NSW, Australia"
  },

];


context('Actions', () => {
  beforeEach(() => {
    //assumes environment variable set on execution
    cy.visit(Cypress.env('host'))
  })

    for (let i=0; i<addresses.length; i+=1) {
        // https://on.cypress.io/interacting-with-elements
        it('.type() - type into a DOM element', () => {
            cy.get('#home')
                .type(addresses[i].home).should('have.value', addresses[i].home)

            cy.get('#work')
                .type(addresses[i].work).should('have.value',addresses[i].work)  

            cy.get('[name="home_time"]').select('07:00')
            cy.get('.col-lg-offset-2 > .form-group > .service-item > .select-date').select('17:00')

            cy.get('#submit').click('top')
                   
        })
    }
  
})