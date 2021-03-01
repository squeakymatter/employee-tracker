// get inquirer
const mysql = require('mysql2')
const inquirer = require('inquirer')
const cTable = require('console.table')
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
        'Add a Role',
        'Add an Employee',
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
        case 'Add a Role':
          addRole()
          break
        case 'Add an Employee':
          console.log('Add an employee')
          addEmployee()
          break
        case 'Update an Employee Role':
          // updateEmployeeRole();
          console.log('update employee role')
          break
        case 'Exit Employee Tracker':
          console.log('Thanks for using the Employee Tracker.')
          connection.end()
        // break
      }
    })
}

viewAllDepartments = () => {
  connection.query('SELECT * FROM departments', function (err, results) {
    if (err) throw err
    const table = cTable.getTable('All Departments', results)
    console.log(table)
    promptUserAction()
  })
}

// All Roles: job title, role id, the department that role belongs to, and the salary for that role
viewAllRoles = () => {
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

// All Employees: employee ids, first names, last names, job titles, departments, salaries, and managers
viewAllEmployees = () => {
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

//add a role
// enter the name, salary, and department for the role and that role is added to the database

const addRole = function () {
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
          promptUserAction()
        })
    })
}

// add an employee
// enter the employee’s first name, last name, role, and manager
// that employee is added to the database
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
            .query('SELECT first_name, id FROM employees')
            .then((rows) => {
              const employeeList = rows[0].map((row) => {
                return {
                  name: row.first_name,
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

// add a department
// enter the name of the department
// that department is added to the database

// add a role
// enter the name, salary, and department for the role
// that role is added to the database

// update an employee role
// prompted to select an employee to update and their new role
//this information is updated in the database
