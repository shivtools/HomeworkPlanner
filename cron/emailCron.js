var MongoClient = require('mongodb').MongoClient
var url = 'mongodb://127.0.0.1:3001/meteor'
/* 
	Our goal is to run a cronjob daily that will:
		- iterate through all the tasks in our database
		- for each task, see if task is within 24 hours away from current day
		- if so, then send an email to the user(s) associated with that task
*/

MongoClient.connect(url, function(err, db) {

  // let taskCollection = db.collection('tasks');
  db.collection('tasks').find({}, function(err, results){
  	//console.log(results);
  });

  db.close();
});
