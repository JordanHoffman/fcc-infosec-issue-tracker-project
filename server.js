//Takeaways: Make sure your app.listen is within the mongo connection encapsulation brackets if your routes are within that encapsulation too. Otherwise I think it listens to a form of the code prior to the actual connection, and thus it can't find any routes! If your routes are outside that encapsulation (outside the connection), it works fine.

'use strict';

var express     = require('express');
var bodyParser  = require('body-parser');
var expect      = require('chai').expect;
var cors        = require('cors');

var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');
var helmet = require('helmet')
var app = express();

var MongoClient = require('mongodb').MongoClient;

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//SECURITY REQUIREMENTS
app.use(helmet.xssFilter())

//Sample front-end
app.route('/:project/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/issue.html');
  });

//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

MongoClient.connect(process.env.DATABASE, {useUnifiedTopology:true}, (err, client) => 
{
  //IMPORTANT: this code is now updated for Mongo 3.0 where the connect function now returns the client and the db comes from the client
  var db = client.db('AdvNodeExpressDBChallenges')
  if(err) 
  {
    console.log('Database error: ' + err);
  } else 
  {
    console.log('Successful database connection');
    //For FCC testing purposes
    fccTestingRoutes(app);

    //Routing for API 
    apiRoutes(app, db);  

    //404 Not Found Middleware
    app.use(function(req, res, next) {
      console.log("not found")
      res.status(404)
        .type('text')
        .send('Not Found');
    });

    //Start our server and tests!
    app.listen(process.env.PORT || 3000, function () {
      console.log("Listening on port " + process.env.PORT);
      if(process.env.NODE_ENV==='test') {
        console.log('Running Tests...');
        setTimeout(function () {
          try {
            runner.run();
          } catch(e) {
            var error = e;
              console.log('Tests are not valid:');
              console.log(error);
          }
        }, 3500);
      }
    });

    module.exports = app; //for testing
  }
})

