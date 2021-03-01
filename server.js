// get inquirer
const mysql = require('mysql2')
const inquirer = require('inquirer')
const cTable = require('console.table')
const figlet = require('figlet')
const chalk = require('chalk')
const { clear } = require('console')

// create the connection to database
const connection = mysql.createConnection({
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: 'password',
  database: 'employee_db',
})

connection.connect((err) => {
  if (err) throw err
  console.log('connected as id ' + connection.threadId + '\n')
  console.log(
    chalk.blue(
      figlet.textSync('Employee\n\n Tracker', { horizontalLayout: 'full' })
    )
  )
  promptUserAction()
})

function promptUserAction() {
  inquirer
    .prompt({
      type: 'list',
      name: 'task',
      message: 'What would you like to do?',
      choices: [
        'View All Departments',
        'View All Roles',
        'View All Employees',
        'Add a New Department',
        'Add a New Role',
        'Add a New Employee',
        'Update an Employee Role',
        'Exit Employee Tracker',
      ],
    })
    .then((result) => {
      console.clear()
      switch (result.task) {
        case 'View All Departments':
          viewAllDepartments()
          break
        case 'View All Roles':
          viewAllRoles()
          break
        case 'View All Employees':
          viewAllEmployees()
          break
        case 'Add a New Department':
          addDepartment()
          break
        case 'Add a New Role':
          addRole()
          break
        case 'Add a New Employee':
          addEmployee()
          break
        case 'Update an Employee Role':
          updateEmployeeRole()
          break
        case 'Exit Employee Tracker':
          console.clear()
          console.log('Thanks for using the Employee Tracker.')
          connection.end()
      }
    })
}

const viewAllDepartments = () => {
  connection.query('SELECT * FROM departments', function (err, results) {
    if (err) throw err
    const table = cTable.getTable('All Departments', results)
    console.log(table)
    promptUserAction()
  })
}

const viewAllRoles = () => {
  let query = `
  SELECT roles.id AS 'ID', roles.title AS 'Job Title', departments.name AS 'Department', roles.salary AS 'Salary'
  FROM roles
  INNER JOIN departments ON roles.department_id = departments.id
  ORDER BY departments.name;`
  connection.query(query, function (err, results) {
    if (err) throw err
    const table = cTable.getTable('All Roles', results)
    console.log(table)
    promptUserAction()
  })
}
const viewAllEmployees = () => {
  let query = `
  SELECT e.id, e.first_name AS "First Name", e.last_name AS "Last Name", roles.title AS "Job Title", departments.name AS "Department", FORMAT(roles.salary, 'C') Salary, CONCAT(m.first_name, ' ', m.last_name) AS Manager
  FROM employees e
  LEFT JOIN roles ON e.role_id = roles.id 
  LEFT JOIN departments ON roles.department_id = departments.id
  LEFT JOIN employees m ON e.manager_id = m.id;`

  connection.query(query, function (err, results) {
    if (err) throw err
    const table = cTable.getTable('All Employees', results)
    console.log(table)
    promptUserAction()
  })
}

const addRole = function () {
  console.clear()
  connection
    .promise()
    .query('SELECT name, id FROM departments')
    .then((rows) => {
      const depts = rows[0].map((row) => {
        return {
          name: row.name,
          value: row.id,
        }
      })
      inquirer
        .prompt([
          {
            type: 'input',
            name: 'title',
            message: 'What is the job title?',
          },
          {
            type: 'number',
            name: 'salary',
            message: 'Enter the annual salary',
          },
          {
            type: 'list',
            name: 'department_id',
            message: 'Select Department:',
            choices: depts,
          },
        ])
        .then((newRole) => {
          connection.promise().query('INSERT INTO roles SET ?', newRole)
        })
        .then(() => {
          viewAllRoles()
        })
    })
}

const addEmployee = function () {
  connection
    .promise()
    .query('SELECT title, id FROM roles')
    .then((rows) => {
      const roles = rows[0].map((row) => {
        return {
          name: row.title,
          value: row.id,
        }
      })
      inquirer
        .prompt([
          {
            type: 'input',
            name: 'first_name',
            message: "What is the employee's first name?",
          },
          {
            type: 'input',
            name: 'last_name',
            message: "What is the employee's last name?",
          },
          {
            type: 'list',
            name: 'role',
            message: 'Select Role:',
            choices: roles,
          },
        ])
        .then((results) => {
          const { first_name, last_name, role } = results
          connection
            .promise()
            .query(
              `SELECT CONCAT(first_name, ' ', last_name) AS Manager, id FROM employees`
            )
            .then((rows) => {
              const employeeList = rows[0].map((row) => {
                return {
                  name: row.Manager,
                  value: row.id,
                }
              })
              employeeList.push({ name: 'none', value: null })
              inquirer
                .prompt([
                  {
                    type: 'list',
                    name: 'manager_id',
                    message: "Choose the employee's manager",
                    choices: employeeList,
                  },
                ])
                .then((newEmployee) => {
                  const employee = {
                    first_name: first_name,
                    last_name: last_name,
                    role_id: role,
                    manager_id: newEmployee.manager_id,
                  }
                  connection
                    .promise()
                    .query('INSERT INTO employees SET ?', employee)
                })
                .then(() => {
                  console.log(`\n Employee added. \n`)
                  viewAllEmployees()
                })
            })
        })
    })
}
const addDepartment = function () {
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'dept_name',
        message: "Enter new department's name:",
      },
    ])
    .then((newDepartment) => {
      connection.query(
        'INSERT INTO departments SET ?',
        {
          name: newDepartment.dept_name,
        },
        function (error) {
          if (error) throw error
          console.log('\n Added new department. \n')
          viewAllDepartments()
        }
      )
    })
}
const updateEmployeeRole = function () {
  console.clear()
  let selectedId = ''
  let updatedRoleId = ''
  connection
    .promise()
    .query(
      'SELECT CONCAT(first_name, " ", last_name) AS Employee, id FROM employees'
    )
    .then((rows) => {
      const employeeList = rows[0].map((row) => {
        return {
          name: row.Employee,
          value: row.id,
        }
      })
      console.log(
        'this is the entire employeeList and the employees.id',
        employeeList
      )
      inquirer
        .prompt([
          {
            type: 'list',
            name: 'name_update',
            message: 'Select an employee to update:',
            choices: employeeList,
          },
        ])
        .then((res) => {
          selectedId = res.name_update
          console.log('this is the selected user Id', selectedId)
          connection
            .promise()
            .query('SELECT title, id FROM roles')
            .then((rows) => {
              const rolesList = rows[0].map((row) => {
                return {
                  name: row.title,
                  value: row.id,
                }
              })
              inquirer
                .prompt([
                  {
                    type: 'list',
                    name: 'role_id',
                    message: "What is the employee's new role?",
                    choices: rolesList,
                  },
                ])
                .then((result) => {
                  console.log('result', result.role_id)
                  connection
                    .promise()
                    .query('UPDATE employees SET role_id = ? WHERE id = ?', [
                      result.role_id,
                      selectedId,
                    ])
                    .then(() => {
                      console.log('\n Role updated. \n')
                      viewAllEmployees()
                    })
                })
            })
        })
    })
}
