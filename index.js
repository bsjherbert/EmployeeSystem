const inquirer = require("inquirer");
const mysql = require("mysql");

const addDepartment = () => {
    inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "Department name?"
        }
    ]).then(deptAnswer => {
        connection.query("INSERT INTO department (name) VALUES (?)", [deptAnswer.name], (err, data) => {
            if (err) throw err;
            console.log(`Added ${deptAnswer.name} to department.`);
            mainMenu();
        });
    });
};

const addRole = () => {
    connection.query("SELECT * FROM department", (err, data) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: "title",
                type: "input",
                message: "Title"
            },
            {
                name: "salary",
                type: "input",
                message: "Salary"
            },
            {
                name: "department",
                type: "list",
                message: "Department",
                choices: function () {
                    return data.map(row => {
                        return { name: row.name, value: row.id, short: row.name };
                    })
                }
            }
        ]).then(answers => {
            connection.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)", [answers.title, answers.salary, answers.department], (err, data) => {
                if (err) throw err;
                mainMenu();
            });
        });

    });
};

const addEmployee = () => {
    connection.query("SELECT * FROM role", (err, roles) => {
        if (err) throw err;
        connection.query("SELECT * FROM employee", (err, employees) => {
            if (err) throw err;

            inquirer.prompt([
                {
                    type: "input",
                    name: "firstName",
                    message: "First Name?"
                },
                {
                    type: "input",
                    name: "lastName",
                    message: "Last Name?"
                },
                {
                    type: "list",
                    name: "roleId",
                    message: "Role?",
                    choices: function () {
                        return roles.map(role => {
                            return { name: role.title, value: role.id, short: role.title };
                        });
                    }
                },
                {
                    type: "list",
                    name: "managerId",
                    message: "Manager?",
                    choices: function () {
                        return employees.map(employee => {
                            return { name: `${employee.first_name} ${employee.last_name}`, value: employee.id, short: employee.last_name };
                        })
                    }
                }
            ]).then(answers => {
                connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)",
                [answers.firstName, answers.lastName, answers.roleId, answers.managerId],
                (err, results) => {
                    if (err) throw err;
                    mainMenu();
                }
                );
            });
        });
    });
};

const viewEmployees = () => {
    connection.query(`SELECT e.first_name, e.last_name, r.title AS role_title, CONCAT(mgr.first_name, mgr.last_name) AS managers_name
    FROM employee AS e
    LEFT JOIN role AS r ON e.role_id = r.id
    LEFT JOIN employee AS mgr ON e.manager_id = mgr.id
    LEFT JOIN department AS d ON r.department_id = d.id`,
    (err, results) => {
        console.table(results);
        mainMenu();
    });

};

const mainMenu = () => {
    inquirer.prompt([
        {
            type: "list",
            name: "todo",
            message: "What would you like to do?",
            choices: [
                "Add a Department",
                "Add a Role",
                "Add an Employee",
                "View Employees",
                "Exit" 
            ]
        }
    ]).then(userAnswers => {
        switch (userAnswers.todo) {
            case "Add a Department":
                addDepartment();
                break;
            case "Add a Role":
                addRole();
                break;
            case "Add an Employee":
                addEmployee();
                break;
            case "View Employees":
                viewEmployees();
                break;
            default:
                console.log("Exiting...");
                connection.end();
        }
    });
}

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Waynesworld13!",
    database: "employees_db"
});

connection.connect(function (err) {
    if (err) throw err;
    mainMenu();
});