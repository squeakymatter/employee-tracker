// get inquirer
const mysql = require('mysql2')
const inquirer = require('inquirer')
const actions = require('./actions')
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
          // addEmployee()
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
    console.log('All Departments \n')
    console.table(results)
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
    console.log('All Roles \n')
    console.table(results)
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
    console.log('All Employees \n')
    console.table(results)
    promptUserAction()
  })
}

//add a role
// enter the name, salary, and department for the role and that role is added to the database
addRole = () => {
  //map over all departments and pull out name and id... set it equal to variable sot hat every time you add new dept, it'll also add it here.
  //variable will be array of objects and that will be what to add to line 131 instead of 

  //google up .map 

  inquirer
    .prompt([
      {
        type: 'input',
        name: 'job_title',
        message: 'What is the job title?',
      },
      {
        type: 'number',
        name: 'salary',
        message: 'Enter the annual salary',
      },
      {
        type: 'list',
        name: 'department',
        message: 'Select Department:',
        choices: ['Sales', 'Engineering', 'Finance', 'Legal'],
      },
    ])
    .then((result) => {
      if (result.department === 'Sales') {
        return (result.department = 1)
      }
      if (result.department === 'Engineering') {
        return (result.department = 2)
      }
      if (result.department === 'Finance') {
        return (result.department = 3)
      }
      if (result.department === 'Legal') {
        return (result.department = 4)
      }

      
      connection.query('Select * FROM roles', function (error, rows) {
        if (err) throw err
    
      let query = `
      INSERT INTO roles
      VALUES (${result.job_title}, ${result.salary}, ${result.department_id}) `
      connection.query(query, function (err, result) {
        if (err) throw err
        console.log('All Employees \n')
        console.table(result)
        promptUserAction()
      })
    })
}

// add a department
// enter the name of the department
// that department is added to the database

// add a role
// enter the name, salary, and department for the role
// that role is added to the database

// add an employee
// enter the employee’s first name, last name, role, and manager
// that employee is added to the database

// update an employee role
// prompted to select an employee to update and their new role
//this information is updated in the database
