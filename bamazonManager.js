const inquirer = require("inquirer");
const mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "t0b9a2a1asdelsq",
    database: "bamazon"
});

function printTableFromQuery(query) {
    connection.query(query, function(error, results) {
        if (error) throw error;
        console.table(results);
    })
}
connection.connect(async function(error) {
    if (error) throw error;
    await inquirer.prompt([
        {
            name: "method",
            message: "Welcome manager, what would you like to do?",
            type: "list",
            choices: ["View Products For Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
        }
    ]).then(async function(response) {
        switch (response.method) {
            case "View Products For Sale":
                printTableFromQuery("SELECT * FROM products");
                break;

            case "View Low Inventory":
                printTableFromQuery("SELECT * FROM products WHERE stock_quantity<5");
                break;

            case "Add to Inventory":
                await inquirer.prompt([
                    {
                        name: "id",
                        message: "Enter item id:",
                        type: "number"
                    },
                    {
                        name: "quantity",
                        message: "How much to add?",
                        type: "number"
                    }
                ]).then(async function(response) {
                    if (response.id && response.quantity) {
                        let newQuantity;
                        let queryOne = await new Promise(function(resolve, reject) {
                            connection.query(`SELECT * FROM products WHERE item_id=${response.id}`, function(error, results) {
                                if (error) throw error;
                                newQuantity = results[0].stock_quantity + parseInt(response.quantity);
                                resolve(true)
                            })
                        })
                        let queryTwo = await new Promise(function (resolve, reject) { 
                            connection.query(`UPDATE products SET stock_quantity=${newQuantity} WHERE item_id=${response.id}`, function(error) {
                                if (error) throw error;
                                console.log("Done!");
                                resolve(true);
                            });
                        })
                    }
                })
                break;

            case "Add New Product":
                await inquirer.prompt([
                    {
                        name: "name",
                        message: "Enter product name",
                        type: "input"
                    },
                    {
                        name: "department",
                        message: "Enter department name",
                        type: "input"
                    },
                    {
                        name: "price",
                        message: "Enter price",
                        type: "number"
                    },
                    {
                        name: "quantity",
                        message: "Enter quantity",
                        type: "number"
                    }
                ]).then(function(response) {
                    if (response.name && response.department && response.price && response.quantity) {
                        connection.query(`INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ('${response.name}', '${response.department}', ${response.price}, ${response.quantity})`, function(error) {
                            if (error) throw error;
                            console.log("Done!");
                        })
                    }
                })
        }
    })
    connection.end()
})