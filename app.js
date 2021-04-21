const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const cors = require('cors');
const firebase = require("firebase-admin");
const nodemailer = require('nodemailer');
const request = require("request");
const apps = express();
const session = require('cookie-session');
const cookieParser = require('cookie-parser');
const server = require('http').createServer(apps);
const io = require('socket.io')(server);
const HashMap = require('hashmap');
const jsSHA = require("jssha");
const TJO = require('translate-json-object')(); // to tr9
const bodyParser = require('body-parser');
const fs = require('fs'); /// to read file
const JSEncrypt = require('node-jsencrypt'); //https://travistidwell.com/jsencrypt/#
const { BasicBot } = require('neural-chatbot');
// create a phrase database for response
const { UserData } = require('neural-phrasex');

// allow cross-origin requests
// initialization express
apps.use(cors());
apps.disable('x-powered-by');
apps.set('trust proxy', true);
apps.use(bodyParser.urlencoded({ extended: true }));
apps.use(bodyParser.json());
apps.use(cors());
apps.use(cookieParser());
apps.use(session({
    keys: ['coockiepassword'],

    cookie: { secure: true, maxAge: 7200000 }
}));
// initialised firebase
firebase.initializeApp({
	credential: firebase.credential.cert(serviceAccount),
	databaseURL: "https://myprojectname.firebaseio.com"

});
// initialization smtp-email sender
const mailTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 487,
    secure: false, // use SSL
    auth: {
        user: config.mail,
        pass: config.pwd,
    }
});

// initialization bot chat
let conf = {
    database: db,
    doc: {
    description: {
        name: "jimmy",
    },
    },
}
let bot = new BasicBot()
 bot.initialize(conf)

// connect to mlab database
// make sure to replace my db string & creds with your own
mongoose.connect('mongodb://ninja:test@ds161148.mlab.com:61148/graphql-ninja')
mongoose.connection.once('open', () => {
    console.log('conneted to database');
});

// bind express with graphql
apps.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));
apps.get('/', (req, res) => {

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<form action="me1" method="post">');
    res.write('Id <input type="text" id="t1" name="name"><br>ToId <input type="text" id="mail" name="t2"><br>Message <input type="text" id="t1" name="sub"><br> Token <input type="text" id="t1" name="num"><br>Language <input type="text" id="t1" name="message"><br>Delete User <input type="text" id="t2" name="uid"><br>Delete Business <input type="text" id="t2" name="bid">');
    res.write('<input type="file" name="f1"><br>');
    res.write('<button type="submit" id="submitButton">Submit</button>');
    res.write('</form>');
    return res.end();
});

apps.get('/bot',async (req, res)=>{
    let ans = await bot.getResult(phrase, req.data);
    console.log('ans', ans);
});

const PORTs = process.env.PORT || 8083;
server.listen(PORTs, () => {
    console.log(`App listening on port ${PORTs}`);
    console.log('Press Ctrl+C to quit.');
    console.log('Goto http://localhost:' + PORTs);

});


//Online chat
io.on('connection', client => {
    client.on('sendMessage', (data) => {
        console.log('Socket got', data);
        client.broadcast.emit(data.id, data.data);
    });

});