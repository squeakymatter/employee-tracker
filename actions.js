//require connection
const connection = require('./server.js')

//require console.table
const cTable = require('console.table')

//viewAllDepartments()
exports.viewAllDepartments = (queryString) => {
  return connection.query(queryString, function (err, results) {
    if (err) throw err
    console.table(`\n`, results)
  })
}

//view all roles:
exports.viewAllRoles = () => {
  connection.query('SELECT * FROM `roles`', function (err, results) {
    cTable(results) // results contains rows returned by server
  })
}

//viewAllDepartments()
//   viewAllRoles()
//   viewAllEmployees()
//    addARole()
// addEmployee()
// updateEmployeeRole();

//       connection.query(
//         'INSERT INTO baes SET ?',
//         {
//           characterName: answers.characterName,
//           datesGoneOn: 0,
//           intrests: answers.intrests,
//           favoriteFood: answers.food,
//           favoriteMusic: answers.music,
//         },
//         function (error) {
//           if (error) throw error
//           console.log('added Bae')
//           querying()
//         }
//       )
//     })
// }

// view all departments = table showing department names and department ids

// view all roles =  job title, role id, the department that role belongs to, and the salary for that role

// view all employees = formatted table showing employee data, including employee ids, first names, last names, job titles, departments, salaries, and managers that the employees report to
// add a department = enter the name of the department and that department is added to the database

// add a role = name, salary, and department for the role and that role is added to the database

// add an employee = enter employee’s first name, last name, role, and manager and that employee is added to the database

// update an employee role =  select an employee to update and their new role and this information is updated in the database

//What would you like to do? (list of options)
// Options:
//View All Employees
// View All Employees By Departmnet
// View All Employees By Manager
// Add Employee
// What is the employee's first name?
// What is the employee's last name?
// What is the employee's title?
// What is the employees role
//select from list
// Who is the employee's manager
//selection from list
// Remove Employee
//Which employee do you want to remove?
// Update Employee Role
// Update Employee Manager
//Which employees manager would you like to update?
// Select from dropdown

// View All Roles
