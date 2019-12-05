/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var ObjectID = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB;
              
module.exports = function (app, db) 
{
  app.route('/api/issues/:project')

  .get(function (req, res){
    var project = req.params.project;
    req.query['project_name'] = project
    
    // console.log("the query: " + req.query)
    
    //TODO: USE .project method to prevent project_name field from returning!!!
    db.collection('issues').find(req.query).project({project_name: 0}).toArray(function(err, result){
      if (err){
        console.log("error finding projects: " + err)
      } else {
        res.send(result)
      }
    })

  })
  
  //So for the post, the body attributes we are interested in are the "name" attributes from the first form. They are issue_title, issue_text, created_by, assigned_to, status_text. These are not in the form, but must also be included: created_on(date/time), updated_on(date/time), open(boolean, true for open, false for closed), and _id.
  .post(function (req, res)
  {
    var project = req.params.project
    
    db.collection('issues').insertOne
    (
      //first arg: the doc to insert
      {
        //The project name is not returned, but I'll need it in the future to find all issues related to the project
        project_name: project,
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to,
        status_text: req.body.status_text,
        created_on: new Date().toISOString(),
        updated_on: "",
        open: true
      },
      //second arg: the callback
      (err, doc) => 
      {
        if (err) {
          console.log("error creating user")
        } else {
          //confused on the doc object? See here: https://github.com/mongodb/node-mongodb-native#insert-a-document
          var doc = doc.ops[0]
          delete doc.project_name
          console.log(doc)
          res.json(doc)
        }
      }
    )
  })

  .put(function (req, res)
  {
    var project = req.params.project;
    //I can use findOneAndUpdate(filter, update, options, callback). I should set "returnOriginal" to false in the "options" to return the updated. The callback takes the form (error, result)=>{}. result.value will contain either the updated object or 'null' if no object was found. I must also return "no updated field sent" if there's no filled in form parts to update
    var updateObject = {}
    if (req.body.issue_title.length) updateObject["issue_title"] = req.body.issue_title
    if (req.body.issue_text.length) updateObject["issue_text"] = req.body.issue_text
    if (req.body.created_by.length) updateObject['created_by'] = req.body.created_by
    if (req.body.assigned_to.length) updateObject['assigned_to'] = req.body.assigned_to
    if (req.body.status_text.length) updateObject['status_text'] = req.body.status_text
    //if unchecked, the "open" is undefined. Otherwise its value is the string false. But the simplest thing is just to check whether it's undefined or not.
    if (typeof(req.body.open) !== 'undefined') updateObject['open'] = false;
    
    //Check if the object is empty (weird construcor test part b/c Date() objects have no keys and yet are meaningful objects)
    if (Object.keys(updateObject).length === 0 && updateObject.constructor === Object){
      //return nothing changed
      return res.send("no updated field sent")
    }
    
    //At this point, the updateObject has been verified to have entries, so lets now add the "updated_on" entry to it
    updateObject['updated_on'] = new Date().toISOString()
    
    //An error occurs if an invalid object ID is sent, so we must first validate it
    if(!(ObjectID.isValid(req.body._id) && (new ObjectID(req.body._id)).toString() === req.body._id)){
      return res.send("Could not find object with the given ID")
    }
    
    db.collection('issues').findOneAndUpdate
    (
      {_id:ObjectID(req.body._id)}, 
      {$set: updateObject}, 
      {returnOriginal:false},
      (error, result)=>{
        if (error) console.log("Error finding and updating: " + error)
        else if (result.value){
          // console.log(result.value)
          return res.send("successfully updated")
        }else {//Resultvalue is null which means it wasn't found
          return res.send("Could not find object with the given ID")
        }
      }
    )
  })

  //3 cases: 1) no id sent: "id error" 2) couldn't find: 'could not delete '+_id 3) success: 'deleted '+_id
  .delete(function (req, res){
    var project = req.params.project;
    if(req.body._id.length == 0){
      return res.send("_id error")
    }
    else if(!(ObjectID.isValid(req.body._id) && (new ObjectID(req.body._id)).toString() === req.body._id))
    {//improper id given, so can't find it to delete
      console.log("improper id")
      return res.send("could not delete " + req.body._id)
    } else
    {
      db.collection('issues').deleteOne
      (
        {_id:ObjectID(req.body._id)},
        (error, result)=>{
          if (error) console.log("Error deleting: " + error)
          else{
            if (result.n == 1){
              return res.send("deleted " + req.body._id)
            }else{//result.n == 0 so it couldn't find it
              console.log("couldn't find proper id")
              return res.send("could not delete " + req.body._id)
            }
          }
        }
      )
      
    }
  });
};
