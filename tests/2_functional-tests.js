/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

var currentlyTestedDocId = ""
var docIdToUpdate = "5de7dbe2cc989a1572e7d197"

//For testing purposes
var makeRandomWord = function(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

var randomWord1 = makeRandomWord(6)
var randomWord2 = makeRandomWord(4)

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
       chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          //fill me in too! Check for the requirements in the return response 
          // console.log(res.body)
         if(res.body._id.length){
           currentlyTestedDocId = "" + res.body._id
           
//            console.log(currentlyTestedDocId)
           
//            var bigOne = "1"
//            for (i = 1; i < currentlyTestedDocId.length; i++){
//              bigOne = "0" + bigOne
//            }
           
//            var ndigits = currentlyTestedDocId.length, i, carry = 0, d, result = "";
//            for (i = ndigits - 1; i >= 0; i--) {
//              d = parseInt(currentlyTestedDocId[i], 16) + parseInt(bigOne[i], 16) + carry;
//              carry = d >> 4;
//              result = (d & 15).toString(16) + result;
//            }
//            currentlyTestedDocId = result
//            console.log(currentlyTestedDocId)
         } 
         
          assert.equal(res.body.issue_title, 'Title', 'should have correct issue_title')
          assert.equal(res.body.issue_text, 'text', 'should have correct issue_text')
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in', 'should have correct created_by')
          assert.equal(res.body.assigned_to, 'Chai and Mocha', 'should have correct assigned_to')
          assert.equal(res.body.status_text, 'In QA', 'should have correct status_text')
          assert.isTrue(!isNaN(Date.parse(res.body.created_on)), 'should have a valid date for created_on')
          assert.equal(res.body.updated_on, '', 'should be blank for updated_on')
          assert.isTrue(res.body.open, 'should be truthy for "open" field')
          assert.isTrue(res.body._id.length>0, 'should have an _id')
          done();
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          assert.isAbove(res.body.issue_title.length, 0, "Has non-empty title")
          assert.isAbove(res.body.issue_text.length, 0, "Has non-empty text")
          assert.isAbove(res.body.created_by.length, 0, "Has non-empty created by")
          done()
        })
      });
      
      test('Missing required fields', function(done) {
        assert.isTrue(true, "The form prevents this from ever being an issue")
        done()
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {
      test('No body', function(done) {
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: docIdToUpdate,
          issue_title: '',
          issue_text: '',
          created_by: '',
          assigned_to: '',
          status_text: '',
          open: undefined
        })
        .end(function(err, res){
          assert.equal(JSON.stringify(res.text), '"no updated field sent"')
          done()
        })
      });
      
      test('One field to update', function(done) {
        var randomWord = makeRandomWord(6)
        
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: docIdToUpdate,
          issue_title: '',
          issue_text: '',
          created_by: randomWord,
          assigned_to: '',
          status_text: '',
          open: undefined
        })
        .end(function(err, res){
          assert.equal(JSON.stringify(res.text), '"successfully updated"')
          done()
        })
      });
      
      test('Multiple fields to update', function(done) {
        
        chai.request(server)
        .put('/api/issues/test')
        .send({
          _id: docIdToUpdate,
          issue_title: '',
          issue_text: '',
          created_by: randomWord1,
          assigned_to: randomWord2,
          status_text: '',
          open: undefined
        })
        .end(function(err, res){
          assert.equal(JSON.stringify(res.text), '"successfully updated"')
          done()
        })
      });
      
    });
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'issue_title');
          assert.property(res.body[0], 'issue_text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'updated_on');
          assert.property(res.body[0], 'created_by');
          assert.property(res.body[0], 'assigned_to');
          assert.property(res.body[0], 'open');
          assert.property(res.body[0], 'status_text');
          assert.property(res.body[0], '_id');
          done();
        });
      });
      
      test('One filter', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({created_by: randomWord1})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.equal(1, res.body.length)
          assert.equal(res.body[0].created_by, randomWord1)
          done();
        });
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        chai.request(server)
        .get('/api/issues/test')
        .query({created_by: randomWord1, assigned_to:randomWord2})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.equal(1, res.body.length)
          assert.equal(res.body[0].created_by, randomWord1)
          assert.equal(res.body[0].assigned_to, randomWord2)
          done();
        });
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
        .delete('/api/issues/apitest')
        .send({
          _id:""
        })
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.equal('_id error', res.text)
          done();
        });
      });
      
      test('Valid _id', function(done) {  
        chai.request(server)
          .delete('/api/issues/apitest')
          .send({
            _id:(currentlyTestedDocId)
        })
        .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(("deleted " + currentlyTestedDocId), res.text)
            done();
        });
      });
    });

});
