require('dotenv').config();
const inquirer = require("inquirer");
const db = require("./db");
const disp = require("asciiart-logo");
require("console.table");

start();
function start() {
    const display = disp({name: "Employee Tracker"}).render();
    console.log(display);
    allPrompts();
}
function allPrompts() {
    inquirer.prompt({
        name: "employee_tracker",
        type: "list",
        message: "Whay would you like to do?",
        choices: [
            "View all Employees",
            "View all Departments",
            "View all Roles",
            "Update Employee Role",
            "Update Employee Manager",
            "Add a Department",
            "Add an Employee",
            "Add a Role",
            "Delete Department",
            "Delete Role",
            "Delete Employee",
            "Exit"
        ]
    }).then(function(answers) {
        if (answers.employee_tracker === "View all Employees") {
            viewAllEmployees();
        } else if (answers.employee_tracker === "View all Departments") {
            viewAllDpts();
        } else if (answers.employee_tracker === "View all Roles") {
            viewAllRoles();
        } else if (answers.employee_tracker === "Update Employee Role") {
            updateEmplRole();
        } else if (answers.employee_tracker === "Update Employee Manager") {
            updateEmplManager();
        } else if (answers.employee_tracker === "Add a Department") {
            addDpt();
        } else if (answers.employee_tracker === "Add an Employee") {
            addEmployee();
        } else if (answers.employee_tracker === "Add a Role") {
            addRole();
        } else if (answers.employee_tracker === "Delete Department") {
            deleteDpt();
        } else if (answers.employee_tracker === "Delete Role") {
            deleteRole();
        } else if (answers.employee_tracker === "Delete Employee") {
            deleteEmployee();
        } else if (answers.employee_tracker === "Exit") {
            end();
        } else {
            connection.end();
        }
    })
}
async function viewAllEmployees() {
    const res = await db.allEmpl();
    console.log("\n");
    console.table(res);
    allPrompts();
}
async function viewAllDpts() {
    const res = await db.allDpt();
    console.log("\n");
    console.table(res);
    allPrompts();
}
async function viewAllRoles() {
    const res = await db.allRoles();
    console.log("\n");
    console.table(res);
    allPrompts();
}
async function addDpt(){
    const dpt = await inquirer.prompt([
        {
            name: "name",
            type: "input",
            message: "Please enter name of the new Department."
        }
    ]);
    await db.newDpt(dpt);
    const dpts = await db.allDpt();
    if (dpts.includes(dpt.name)) {
        console.log(`${dpt.name} already exists. Try again.`)
        addDptFunc();
    }
    console.log(`${dpt.name} was added to the database.`)
    allPrompts();
}
async function addEmployee(){
    const roles = await db.allRoles();
    const employee = await inquirer.prompt([
        {
            name: "first_name",
            message: "Please enter employee's first name."
        },
        {
            name: "last_name",
            message: "Please enter employee's last name."
        }
    ]);
    const rolechoices = roles.map(({Role_title, Role_id}) =>
        ({name: Role_title,
        value: Role_id
    }));
    const { Role_id } = await inquirer.prompt({
            name: "Role_id",
            type: "list",
            message: "Please enter employee's role.",
            choices: rolechoices
    });
    employee.role_id = Role_id;

    const managers = await db.allEmpl();
    const managerchoices = managers.map(({ Employee_id, First_Name, Last_Name }) => ({
        name: `${First_Name} ${Last_Name}`,
        value: Employee_id
    }));
    const { Manager_id} = await inquirer.prompt({
        name: "Manager_id",
        type: "list",
        message: "Please enter employee's manager",
        choices: managerchoices
    });
    employee.manager_id = Manager_id;
    await db.newEmployee(employee);
    console.log(`${employee.first_name} ${employee.last_name} was added.`);
    allPrompts();
}
async function addRole() {
   
    const dpts = await db.allDpt();
    const dptchoices = dpts.map(({ Department, Dpt_id }) => ({
        name: Department,
        value: Dpt_id
    }));

    const newRole = await inquirer.prompt([
        {
            name: "title",
            type: "input",
            message: "Please enter new role name."
        },
        {
            name: "salary",
            type: "input",
            message: "Please enter the salary of the new role."
        },
        {
            name: "department_id",
            type: "list",
            message: "Please enter department the role belongs to.",
            choices: dptchoices
        }
    ]);
    await db.newRole(newRole);
    console.log(`${newRole.title} was added to the database.`)
    allPrompts();
}
async function deleteRole() {
    const roles = await db.allRoles();
    const rolechoices = roles.map(({Role_title, Role_id}) =>({
        name: Role_title,
        value: Role_id
    }));
    const role_id = await inquirer.prompt({
        name: "id",
        type: "list",
        message: "Please enter role you want to remove from the database. All consequent employees will be removed as well.",
        choices: rolechoices
    });
    await db.deleteRole(role_id.id);
    console.log(`Role ${role_id.id} was removed from database.`);
    allPrompts();
}
async function deleteDpt() {
    const dpts = await db.allDpt();
    const dptchoices = dpts.map(({ Department, Dpt_id }) => ({
        name: Department,
        value: Dpt_id
    }));
    const dptId = await inquirer.prompt ({
        name: "id",
        type: "list",
        message: "Please enter department you want to delete from the database.",
        choices: dptchoices
    })
    await db.deleteDpt(dptId.id);
    console.log(`Department ${dptId.id} was deleted from the database.`);
    allPrompts();
}
async function deleteEmployee() {
    const employee = await db.allEmpl();
    const employeeChoices = employee.map(({First_Name, Last_Name, Employee_id}) => ({
        name: `${First_Name} ${Last_Name}`,
        value: Employee_id
    }));
    const emplId = await inquirer.prompt({
        name: "id",
        type: "list",
        message: "Please enter employee you want to delete.",
        choices:  employeeChoices
    });
    await db.deleteEmployee(emplId.id);
    console.log(`Employee ${emplId.id} was deleted.`);
    allPrompts();
}
async function updateEmplManager() {
    const employeeToUpd = await db.allEmpl();
    const employeeChoices = employeeToUpd.map(({First_Name, Last_Name, Employee_id}) => ({
        name: `${First_Name} ${Last_Name}`,
        value: Employee_id
    }));
    const emplId = await inquirer.prompt({
        name: "id",
        type: "list",
        message: "Please enter employee whose manager you want to update to.",
        choices:  employeeChoices
    });
    const managers = await db.allEmpl();
    const managerchoices = managers.map(({ Employee_id, First_Name, Last_Name }) => ({
        name: `${First_Name} ${Last_Name}`,
        value: Employee_id
    }));
    const updtManId = await inquirer.prompt({
        name: "Manager_id",
        type: "list",
        message: "Please enter new employee's manager",
        choices: managerchoices.concat([{name: "none", value: null}])
    });
    await db.updtManager(updtManId.Manager_id, emplId.id);
    console.log("Employee's manager was updated.");
    allPrompts();
}
async function updateEmplRole() {
    const employeeToUpd = await db.allEmpl();
    const employeeChoices = employeeToUpd.map(({First_Name, Last_Name, Employee_id}) => ({
        name: `${First_Name} ${Last_Name}`,
        value: Employee_id
    }));
    const emplId = await inquirer.prompt({
        name: "id",
        type: "list",
        message: "Please enter employee whose role you want to update to.",
        choices:  employeeChoices
    });

    const roles = await db.allRoles();
    const rolechoices = roles.map(({Role_title, Role_id}) =>({
        name: Role_title,
        value: Role_id
    }));
    const updtRoleId = await inquirer.prompt({
        name: "Role_id",
        type: "list",
        message: "Please enter employee's new role.",
        choices: rolechoices
    });
    const managers = await db.allEmpl();
    const managerchoices = managers.map(({ Employee_id, First_Name, Last_Name }) => ({
        name: `${First_Name} ${Last_Name}`,
        value: Employee_id
    }));
    const updtManId = await inquirer.prompt({
        name: "Manager_id",
        type: "list",
        message: "Please enter employee's manager",
        choices: managerchoices.concat([{name: "none", value: null}])
    });
    await db.updtEmpRole(updtRoleId.Role_id, updtManId.Manager_id, emplId.id);
    console.log("Employee's role and Manager were updated.");
    allPrompts();
}

function end() {
    console.log("Good-bye!");
    process.exit();
}