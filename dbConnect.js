var mysql = require('mysql');
var dbConfig = {
   host : 'localhost',
   user : '',
   password : '',
   port : ,
   multipleStatements : true,
   database : 'test'
};



var pool = mysql.createPool(dbConfig);
module.exports = pool;

pool.getConnection(function(err, conn) {
   if ( err ) {
      console.error('Connection Error : ', err);
      return;
   }
   
   /*var fs = require('fs');
   var sqls = fs.readFileSync('./initialData.sql', 'utf8');
   
   conn.query(sqls, function(err, results) {
      if ( err ) {
         console.error('Initialdata error : ', err);
         return;
      }
      console.log('Success');      
   }); */  
});