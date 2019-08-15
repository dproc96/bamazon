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

function pullStorefront() {
    return new Promise(function(resolve, reject) {
        connection.query("SELECT * FROM products WHERE stock_quantity>0", function(error, results) {
            resolve(results);
        })
    })
}

function removeItem(id, stock) {
    return new Promise(function(resolve, reject) {
        let stockQuantity = stock.filter((x) => { return x.item_id === id })[0].stock_quantity;
        connection.query(`UPDATE products SET stock_quantity=${stockQuantity - 1} WHERE item_id=${id}`, function(error, results) {
            if (error) throw error;
            resolve(true);
        })
    })
}

function displayStorefront(stock) {
    return new Promise(function(resolve, reject) {
        inquirer.prompt([
            {
                name: "item",
                message: "Select an item to purchase",
                choices: stock.map((x) => { return `${x.product_name} - ${x.item_id}` }),
                type: "list"
            },
            {
                name: "repeat",
                message: "Would you like to purchase another item?",
                type: "confirm",
                default: true
            }
        ]).then(async function(response) {
            let product = response.item.split(" - ");
            console.log(`Enjoy your order of 1 ${product[0]}!`)
            await removeItem(parseInt(product[1]), stock);
            if (response.repeat) {
                let stock = await pullStorefront();
                await displayStorefront(stock)
                resolve(true);
            }
            else {
                resolve(true);
            }
        })
    })
}

connection.connect(async function(error) {
    if (error) throw error;
    let stock = await pullStorefront();
    await displayStorefront(stock)
    connection.end();
})