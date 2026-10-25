describe('請假列表', () => {
  it('顯示資料，並在重新整理時保留篩選條件', () => {
    cy.intercept('GET', 'http://localhost:8080/api/leaves*', (request) => {
      const selectedStatus = new URL(request.url).searchParams.get('status')
      const leaves = [
        {
          id: 1,
          applicant: '王小明',
          leaveType: '特休',
          startDate: '2026-10-01',
          endDate: '2026-10-02',
          reason: '家庭旅遊',
          status: 'PENDING',
        },
        {
          id: 2,
          applicant: '陳小美',
          leaveType: '病假',
          startDate: '2026-10-05',
          endDate: '2026-10-05',
          reason: '感冒就醫',
          status: 'APPROVED',
        },
      ]

      request.reply({
        data: selectedStatus ? leaves.filter((leave) => leave.status === selectedStatus) : leaves,
        code: null,
        message: null,
      })
    }).as('getLeaves')

    cy.intercept('POST', 'http://localhost:8080/api/auth/login', {
      data: { success: true, message: '登入成功' },
      code: null,
      message: null,
    }).as('login')

    cy.visit('/')
    cy.get('#username').type('admin')
    cy.get('#password').type('1234')
    cy.contains('button', '登入').click()
    cy.wait('@login')
    cy.url().should('include', '/leave')
    cy.wait('@getLeaves')
    cy.contains('h1', '請假系統')
    cy.contains('td', '王小明')
    cy.get('#status-filter').select('APPROVED')
    cy.wait('@getLeaves').its('request.url').should('include', 'status=APPROVED')
    cy.contains('td', '陳小美')
    cy.contains('td', '王小明').should('not.exist')

    cy.contains('button', '重新整理').click()
    cy.wait('@getLeaves').its('request.url').should('include', 'status=APPROVED')
    cy.get('#status-filter').should('have.value', 'APPROVED')
  })

  it('可新增、更新狀態並刪除請假單', () => {
    let leaves = [
      {
        id: 1,
        applicant: '王小明',
        leaveType: '特休',
        startDate: '2026-10-01',
        endDate: '2026-10-02',
        reason: '家庭旅遊',
        status: 'PENDING',
      },
    ]

    cy.intercept('POST', 'http://localhost:8080/api/auth/login', {
      data: { success: true, message: '登入成功' },
      code: null,
      message: null,
    }).as('login')

    cy.intercept('GET', 'http://localhost:8080/api/leaves*', (request) => {
      request.reply({ data: leaves, code: null, message: null })
    }).as('getLeaves')

    cy.intercept('POST', 'http://localhost:8080/api/leaves', (request) => {
      const created = { id: 2, ...request.body, status: 'PENDING' }
      leaves = [...leaves, created]
      request.reply({ data: created, code: null, message: null })
    }).as('createLeave')

    cy.intercept('PUT', 'http://localhost:8080/api/leaves/*/status', (request) => {
      leaves = leaves.map((leave) =>
        leave.id === 2 ? { ...leave, status: request.body.status } : leave,
      )
      request.reply({ data: leaves.find((leave) => leave.id === 2), code: null, message: null })
    }).as('updateStatus')

    cy.intercept('DELETE', 'http://localhost:8080/api/leaves/*', (request) => {
      leaves = leaves.filter((leave) => leave.id !== 2)
      request.reply({ data: null, code: null, message: null })
    }).as('deleteLeave')

    cy.visit('/')
    cy.get('#username').type('admin')
    cy.get('#password').type('1234')
    cy.contains('button', '登入').click()
    cy.wait('@login')
    cy.wait('@getLeaves')

    cy.get('.leave-form input').eq(0).type('測試人員')
    cy.get('.leave-form input').eq(1).type('病假')
    cy.get('.leave-form input').eq(2).type('2026-10-10')
    cy.get('.leave-form input').eq(3).type('2026-10-11')
    cy.get('.leave-form input').eq(4).type('整合測試')
    cy.contains('.leave-form button', '新增').click()
    cy.wait('@createLeave')
    cy.wait('@getLeaves')
    cy.contains('td', '測試人員').should('exist')

    cy.contains('tr', '測試人員').find('.status-select').select('APPROVED')
    cy.wait('@updateStatus')
    cy.wait('@getLeaves')
    cy.contains('tr', '測試人員').find('.status-select').should('have.value', 'APPROVED')

    cy.contains('tr', '測試人員').contains('button', '刪除').click()
    cy.wait('@deleteLeave')
    cy.wait('@getLeaves')
    cy.contains('td', '測試人員').should('not.exist')
  })
})
