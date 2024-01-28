const TelegramBot = require('node-telegram-bot-api')
const token = '6518144843:AAENO-orzxjb0P1QpUj0AWKJcsVRCX1Z_w0'
const bot = new TelegramBot(token, { polling: true })
const developer = 948641423

const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: "payments_api",
    password: '',
});

connection.connect((error) => {
    if(error){
        console.log('Error connecting to the MySQL Database');
        return;
    }
    console.log('Connection established sucessfully');
});


bot.onText(/\/start/, (msg, match) => {
    const chatId = msg.chat.id
    bot.sendMessage(chatId, 'Your ID has been registered successfully!')
    bot.sendMessage(developer, `New Registration: ${chatId} (${msg.chat.first_name}, ${msg.chat.username})`)

    console.log( msg.chat )

    const sql = "INSERT INTO users(id, username) VALUES(?, ?)";
    const user = [chatId, msg.chat.username];

    connection.query(sql, user, function(err, results) {
        if(err) console.log(err);
        else console.log("Данные добавлены");
    });
})

bot.onText(/\/payments/, (msg) => {

    const chatId = msg.chat.id
    const query = "SELECT * FROM payments WHERE id="+chatId;
    connection.query(query, "", function(err, results) {

        let data = "Список платежей: \n\n"
        for (var i in results){
            data += `Дата: ${results[i].date}\nСумма: ${results[i].sum}\nОписание: ${results[i].description}\n`
        }
        bot.sendMessage(chatId, data )

    });
})

bot.onText(/\/pay (.+)/, (msg, match) => {

    const chatId = msg.chat.id
    const resp = match[1]
    const data = resp.split(" ")

    let date = new Date();
    let output = String(date.getDate()).padStart(2, '0') + '.' +
        String(date.getMonth() + 1).padStart(2, '0') + '.' + date.getFullYear();

    const sql = "INSERT INTO payments(id, sum, date, description) VALUES(?, ?, ?, ?)";
    const query = [chatId, data[0], date, resp.slice( data[0].length ) ];

    connection.query(sql, query, function(err, results) {
        if(err) console.log(err);
        else console.log("Данные добавлены");
    });

})

bot.onText(/\/users/, (msg) => {

    const chatId = msg.chat.id
    const sql = "SELECT * FROM users";
    connection.query(sql, "", function(err, results) {

        let data = "Регистрации: \n\n"
        for (var i in results){
            data += `User: ${results[i].username}\nID: ${results[i].id}\n\n`
            console.log( results[i].id )
        }
        bot.sendMessage(chatId, data )

    });
})