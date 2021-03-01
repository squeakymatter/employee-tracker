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
          console.log('Thanks for using the Employee Tracker.')
          connection.end()
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

// add a department
// enter the name of the department
// that department is added to the database
const addDepartment = function () {
  connection.promise()
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'dept_name',
        message: "Enter new department's name:",
      },
    ])
    .then((newDepartment) => {
      console.log(newDepartment)
      connection.query(
        'INSERT INTO departments SET ?',
        {
          name: newDepartment.dept_name,
        },
        function (error) {
          if (error) throw error
          console.log('\n Added New Department \n')
          viewAllDepartments()
        }
      )
      //   connection.promise().query('INSERT INTO roles SET ?', newRole)
      // })
      // .then(() => {
      //   viewAllRoles()
      //   promptUserAction()
      // })
    })
}

// update an employee role
// prompted to select an employee to update and their new role
//this information is updated in the database
const updateEmployeeRole = function () {
  //prompt inquirer 'Select an employee to update their role'
  //choices: show list of existing employees
  //prompt "What is the employee's new role?"
  //choices: list of available roles
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
      inquirer
        .prompt([
          {
            type: 'list',
            name: 'first_name',
            message: 'Select an employee to update:',
            choices: employeeList,
          },
        ])
        .then((res) => {
          const employeeName = res.first_name
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
                  connection
                    .promise()
                    .query('UPDATE employees SET role_id = ? WHERE id = ?', [
                      1,
                      employeeName,
                    ])
                    .then(() => startQuestion())
                })
            })
        })
    })
}
