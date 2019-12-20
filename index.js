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
    console.log("Adding Employee...");
}

const mainMenu = () => {
    inquirer.prompt([
        {
            type: "list",
            name: "todo",
            message: "What would you like to do?",
            choices: [
                "Add a Department",
                "Add a Role",
                "Add an Employee"
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