var express = require('express');
var router = express.Router();
var pool = require('./dbConnect');
var fs=require('fs');
var url=require('url');
var pathUtil = require('path');
var formidable = require('formidable');
var imageDir = __dirname + '/images';
var uploadDir = __dirname + '/upload';

var FCM=require('fcm-node');
var serverKey='';
var fcm=new FCM(serverKey);



router.get('/animals/:animalId/healthItems', showGraphList);
router.post('/animals/:animalId/healthItems',addGraph);

router.get('/users/:userId',showDogList);
router.post('/users/:userId',editHospital);

router.get('/users/:userId/animals',showDogs);
router.post('/users/:userId/animals',addDogs);

router.get('/users/:userId/notis',showNotisList);

router.get('/animals/:animalId',showDogSelect);
router.post('/animals/:animalId',editDog);
router.get('/images/:imageName',showDogImage);

router.get('/users/:userId/myHospital/:hospitalId',showHospitalSelect);
router.get('/hospitals',showMapList);

router.get('/users/:userId/reservations',showReservationList);
router.post('/users/:userId/reservations',addReservation);

router.get('/animals/:animalId/prescripts',showprescriptList);

router.get('/users/:userId/qnas',showQnasList);
router.post('/users/:userId/qnas',addQnas);

router.get('/qnas/:qnaMainId',showQnaRList);
router.post('/qnas/:qnaMainId',addQna);

router.get('/reservations/:reservationId',showReservSelect);
router.post('/reservations/:reservationId',editReserv);


////////////////////////////web

router.get('/webHospital/:hospitalId',webHospital);
router.post('/webHospital/:hospitalId',webEditHospital);

router.get('/webQna/:hospitalId',webQna);

router.get('/webQnaRepeat/:qnaId',webQnaRepeat);
router.post('/webQnaRepeat/:qnaId',webAddQnaRepeat);

router.get('/webUsers/:hospitalId',webUsers);

router.get('/webAnimals/:animalId',webAnimal);
router.post('/webAnimals/:animalId',webEditAnimal);


router.get('/webReserv/:hospitalId',webReserv);
router.post('/webReserv/:hospitalId',webEditReserv);

router.post('/fbId',fbId);

function fbId(req,res,next){
   var fbId=req.body.fbId;
   pool.getConnection(function (err, conn) {
      if(err){
         err.code=500;
         return next(err);
      }
      var sql='SELECT count(id) as c FROM hospital WHERE fbId=?';
      conn.query(sql,fbId,function(err,result){
         if(result[0].c){
            var sql2='SELECT * FROM hospital WHERE fbId=?';
            conn.query(sql2,fbId,function(err,results){
               if(err){
                  err.code=500;
                  conn.release();
                  return next(err);
               }
               res.redirect('http://'+results[0].id);
               conn.release();
            });   
         }else{
            var sql2='INSERT INTO hospital(fbId) VALUES('+fbId+')';
            conn.query(sql2,function(err,result){
               var sql3='SELECT * FROM hospital WHERE fbId=?';
               conn.query(sql3,fbId,function(err,results){
                  if(err){
                     err.code=500;
                     conn.release();
                     return next(err);
                  }
                  res.redirect('http://'+results[0].id);
                  conn.release();   
               });
               
            });   
         }
      });
   });
}



function webEditHospital(req,res,next){
   var hospitalId=req.params.hospitalId;
   var onOff=req.body.onOff;
   var name=req.body.name;
   var address=req.body.address;
   var tel=req.body.phone;
   var daysStart=req.body.daysStart;
   var daysFinish=req.body.daysFinish;
   var endStart=req.body.endStart;
   var endFinish=req.body.endFinish;
   var daysLunchStart=req.body.daysLunchStart;
   var daysLunchFinish=req.body.daysLunchFinish;
   var endLunchStart=req.body.endLunchStart;
   var endLunchFinish=req.body.endLunchFinish;
   var introduce=req.body.introduce;
   var lng=req.body.lng;
   var lat=req.body.lat;
   pool.getConnection(function (err, conn) {
      if(err){
         err.code=500;
         return next(err);
      }
      console.log(onOff);
      if(!onOff){
         onOff=0;
      }
      console.log(onOff);
      var sql='UPDATE hospital SET onOff=?,name=?,address=?,tel=?,daysStart=?,daysFinish=?,endStart=?,endFinish=?,daysLunchStart=?,daysLunchFinish=?,endLunchStart=?,endLunchFinish=?,introduce=?,lng=?,lat=? WHERE id=?';  
      var params=[onOff,name,address,tel,daysStart,daysFinish,endStart,endFinish,daysLunchStart,daysLunchFinish,endLunchStart,endLunchFinish,introduce,lng,lat,hospitalId];
      conn.query(sql,params,function (err, results) {
         
      });
      conn.release();
      webHospital(req,res);
   });

}

function webHospital(req,res,next){
   var hospitalId=req.params.hospitalId;
   pool.getConnection(function(err,conn){
      if(err){
      err.code=500;
      return next(err);
      }
      var sql='SELECT * FROM hospital WHERE id=?';
      
      conn.query(sql,hospitalId,function(err,results){
         if(err){
            err.code=500;
            conn.release();
            return next(err);
         }
         var hospitalInfo=results[0];
         
         var sql2='SELECT * FROM vet WHERE hospitalId=?';   
         conn.query(sql2,hospitalId,function (err, results) {
            if(err){
               err.code=500;
               conn.release();
               return next(err);
            }
            hospitalInfo.vets=results;
            
         });

           
         var sql3='SELECT subject FROM subjects WHERE hospitalId=?';
         conn.query(sql3,hospitalId,function(err,results){
            if(err){
               err.code=500;
               conn.release();
               return next(err);
            }
            hospitalInfo.hospitalSubjects=results;
         });   

         var sql4='SELECT vacationDate FROM vacation WHERE hospitalId=?';
         conn.query(sql4,hospitalId,function(err,results){
            if(err){
               err.code=500;
               conn.release();
               return next(err);
            }
            hospitalInfo.hospitalVacations=results;
            
            res.render('hospitalList',hospitalInfo);
         });
         conn.release();   
      });
   });
}


function webEditReserv(req,res,next){
   var hospitalId=req.params.hospitalId;
   var status=parseInt(req.body.status);
   var id=parseInt(req.body.id);
   pool.getConnection(function (err, conn) {
      if(err){
         err.code=500;
         return next(err);
      }
      console.log(status+","+id);

      var sql='UPDATE reservation SET status=? WHERE id=?';  
      var params=[status,id];
      conn.query(sql,params,function (err, results) {         
      });
      var sql2='SELECT * FROM reservation WHERE id=?';
      conn.query(sql2,id,function(err,results){
         if(err){
            err.code=500;
            conn.release();
            return next(err);
         }
         var userId=results[0].userId;
         var sql5='SELECT * FROM users WHERE id=?';
         conn.query(sql5,userId,function(err,userResult){
            if(err){
               err.code=500;
               conn.release();
               return next(err);
            }
            var hospitalId=results[0].hospitalId;
            var sql3='SELECT name FROM hospital WHERE id=?';
            conn.query(sql3,hospitalId,function(err,result){
               if(err){
                  err.code=500;
                  conn.release();
                  return next(err);
               }
               var message={
                  to:userResult[0].fcmToken,
                  notification:{
                     title:result[0].name,
                     body:'예약 상태가 변경되었습니다.'
                  },
               };
               
               fcm.send(message, function(err, response){
                  if (err) {
                     console.log("Something has gone wrong!");
                  } else {
                     console.log("Successfully sent with response: ", response);
                  }
               });
               var content=result[0].name+" : 예약 상태가 변경되었습니다.";
               var sql4='INSERT INTO notis(content,userId) VALUES(?,?)';
               var params=[content,userId];
               conn.query(sql4,params,function(err,result){
               });
            });
         });
      });
      conn.release();
      webReserv(req,res);
   });
}



function webReserv(req,res,next){
   var hospitalId=req.params.hospitalId;
   pool.getConnection(function(err,conn){
      if(err){
         err.code=500;
         return next(err);
      }
      var sql='SELECT * FROM reservation WHERE hospitalId=?';
      conn.query(sql,hospitalId,function(err,results){
         if(err){
            err.code=500;
            conn.release();
            return next(err);
         }
         res.render('reservList',{data:results});
      });
   });
}

function webEditAnimal(req,res,next){
   var animalId=req.params.animalId;
   var prescriptText=req.body.prescriptText;
   var id=req.body.id;
   var prescriptIcon=req.body.prescriptIcon;
   pool.getConnection(function (err, conn) {
      if(err){
         err.code=500;
         return next(err);
      }

      var sql='UPDATE animals SET prescriptIcon=?,prescriptText=?,animalId=? WHERE id=?';
      var params=[prescriptIcon,prescriptText,animalId,id];
      conn.query(sql,params,function(err,results){
      });
      var sql2='SELECT * FROM users WHERE id=?';
      conn.query(sql2,animalId,function(err,results){
         if(err){
            err.code=500;
            conn.release();
            return next(err);
         }
         var hospitalId=results[0].hospitalId;
         var sql3='SELECT name FROM hospital WHERE id=?';
         conn.query(sql3,hospitalId,function(err,result){
            if(err){
               err.code=500;
               conn.release();
               return next(err);
            }
            var message={
               to:results[0].fcmToken,
               notification:{
                  title:result[0].name,
                  body:'조언이 달렸습니다.'
               },
            };
            
            fcm.send(message, function(err, response){
               if (err) {
                  console.log("Something has gone wrong!");
               } else {
                  console.log("Successfully sent with response: ", response);
               }
            });
            var content=result[0].name+" : 조언이 달렸습니다.";
            var sql4='INSERT INTO notis(content,userId) VALUES(?,?)';
            var params=[content,animalId];
            conn.query(sql4,params,function(err,result){
            });
         });
      });
      conn.release();
      webAnimal(req,res);
   });
}



function webAnimal(req,res,next){
   var animalId=req.params.animalId;
   pool.getConnection(function(err,conn){
      if(err){
         err.code=500;
         return next(err);
      }
      var sql='SELECT * FROM animals WHERE animalId=?';
      conn.query(sql,animalId,function(err,results){
         if(err){
            err.code=500;
            conn.release();
            return next(err);
         }
         res.render('animalList',{data:results});
      });
   });
}

function webUsers(req,res,next){
   var hospitalId=req.params.hospitalId;
   pool.getConnection(function(err,conn){
      if(err){
         err.code=500;
         return next(err);
      }
      var sql='SELECT * FROM users WHERE hospitalId=?';
      conn.query(sql,hospitalId,function(err,results){
         if(err){
            err.code=500;
            conn.release();
            return next(err);
         }
         res.render('usersList',{data:results});
      });
   });
}

function webAddQnaRepeat(req,res,next){
   var qnaId=req.params.qnaId;
   var content=req.body.content;
   var vetId=req.body.vetId;
   pool.getConnection(function(err,conn){
      if(err){
      err.code=500;
      return next(err);
      }
      var sql='INSERT INTO qnarepeat(content,vetId,qnaMainId) VALUES(?,?,?)';
      var params=[content,vetId,qnaId];
      conn.query(sql,params,function(err,result){
         
      });
      conn.release();
      webQnaRepeat(req,res);
   });
}

function webQnaRepeat(req,res,next){
   var qnaId=req.params.qnaId;
   pool.getConnection(function(err,conn){
      if(err){
      err.code=500;
      return next(err);
      }
      var sql='SELECT * FROM qnas WHERE id=?';
      conn.query(sql,qnaId,function(err,result){
         if(err){
            err.code=500;
            conn.release();
            return next(err);
         }
         
         var sql2='SELECT * FROM qnarepeat WHERE qnaMainId=?';
         conn.query(sql2,qnaId,function(err,results){
            if(err){
               err.code=500;
               conn.release();
               return next(err);
            }
            result[0].qnaSubs=results;   
            res.render('qnaRepeat',result[0]);
         });
      });
   });
}

function webQna(req,res,next){
   var hospitalId=req.params.hospitalId;
   pool.getConnection(function(err,conn){
      if(err){
      err.code=500;
      return next(err);
      }
      var sql='SELECT * FROM qnas WHERE hospitalId=?';
      conn.query(sql,hospitalId,function(err,results){
         if(err){
            err.code=500;
            conn.release();
            return next(err);
         }

         
         res.render('qnaList',{data:results});
         console.log(results);
      });
   });
}





function addDogs(req,res,next){
   var form = new formidable.IncomingForm();
   form.keepExtenstion = true;
   form.uploadDir = uploadDir;
   form.parse(req, function(err, fields, files) {
      if ( err ) {
         res.statusCode = 404;
         res.end('Error');
         return;
      }
      
      var userId=req.params.userId;
      var name=fields.name;
      var sex=fields.sex;
      var age=fields.age;
      var type=fields.type;
      var photo=files.photo;
      var ext = pathUtil.extname(photo.name);
      var newFileName = name + ext;
      var newPath = imageDir + pathUtil.sep + newFileName;
      var fullUrl = req.protocol + '://' + req.get('host') + '/images/'+newFileName;
      

      fs.renameSync(photo.path, newPath);

      pool.getConnection(function (err, conn) {
         if(err){
            err.code=500;
            return next(err);
         }
         var sql='INSERT INTO animal(name,sex,type,age,originalPhotoUrl,resizePhotoUrl,userId) VALUES(?,?,?,?,?,?,?)';  
         var params=[name,sex,type,age,fullUrl,fullUrl,userId];
         conn.query(sql,params,function (err, results) {
            conn.release();
            res.send({msg:'success'});
         });
      });
   });
}

function addQna(req,res,next){
   var qnaMainId=req.params.qnaMainId;
   var userId = req.body.userId;
   var content = req.body.content;

   pool.getConnection(function (err, conn) {
      if (err) {
         err.code = 500;
         return next(err);
      }

      var sql = 'INSERT INTO qnarepeat(content,userId,qnaMainId) VALUES(?,?,?)';
      var params=[content,userId,qnaMainId];
      conn.query(sql,params, function (err, result) {
         res.send({ msg: 'success'});
         conn.release();
      });
   });
}

function addGraph(req, res, next) {
   var animalId=req.params.animalId;
   var recordType = req.body.recordType;
   var recordFloat = req.body.recordFloat;

   pool.getConnection(function (err, conn) {
      if (err) {
         err.code = 500;
         return next(err);
      }

      var sql = 'INSERT INTO animals(recordType,recordFloat,animalId) VALUES(?,?,?)';
      var params=[recordType,recordFloat,animalId];
      conn.query(sql,params, function (err, result) {
         res.send({ msg: 'success'});
         conn.release();
      });
   });
}

function addQnas(req,res,next){
   var userId=req.params.userId;
   var question = req.body.question;
   var hospitalId = req.body.hospitalId;
   
   pool.getConnection(function (err, conn) {
      if(err){
         err.code=500;
         return next(err);
      }

      var sql='INSERT INTO qnas(question,userId,hospitalId) VALUES(?,?,?)';
      var params=[question,userId,hospitalId];
      conn.query(sql,params, function (err, result) {
         res.send({ msg: 'success',data:result});
         conn.release();
      });
   });
}

function editDog(req,res,next){
   var form = new formidable.IncomingForm();
   form.keepExtenstion = true;
   form.uploadDir = uploadDir;
   form.parse(req, function(err, fields, files) {
      if ( err ) {
         res.statusCode = 404;
         res.end('Error');
         return;
      }
      
      var animalId=req.params.animalId;
      var name=fields.name;
      var sex=fields.sex;
      var age=fields.age;
      var type=fields.type;
      var photo=files.photo;
      var ext = pathUtil.extname(photo.name);
      var newFileName = name + ext;
      var newPath = imageDir + pathUtil.sep + newFileName;
      var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

      console.log(animalId+","+name+"Path: "+newPath);

      fs.renameSync(photo.path, newPath);

      pool.getConnection(function (err, conn) {
         if(err){
            err.code=500;
            return next(err);
         }
         var sql='UPDATE animal SET name=?,sex=?,age=?,type=?,resizePhotoUrl=? WHERE id=?';  
         var params=[name,sex,age,type,fullUrl,animalId];
         conn.query(sql,params,function (err, results) {
            conn.release();
            res.send({msg:'success'});
         });
      });
   });
}
function editHospital(req,res,next){
   var userId=req.params.userId;
   console.log(req.body.hospitalId+", "+req.body.fcmToken);
   if(req.body.hospitalId){
      var hospitalId = req.body.hospitalId;
      pool.getConnection(function (err, conn) {
         if(err){
            err.code=500;
            return next(err);
         }
         var sql='UPDATE users SET hospitalId=? WHERE id=?';  
         var params=[hospitalId,userId];
         conn.query(sql,params,function (err, results) {
            conn.release();
            res.send({msg:'success'});
         });
      });   
   }else if(req.body.fcmToken){
      var fcmToken=req.body.fcmToken;
      pool.getConnection(function (err, conn) {
         if(err){
            err.code=500;
            return next(err);
         }
         var sql='UPDATE users SET fcmToken=? WHERE id=?';  
         var params=[fcmToken,userId];
         conn.query(sql,params,function (err, results) {
            conn.release();
            res.send({msg:'success'});
         });
      });
   }
   
}
function editReserv(req,res,next){
   var reservationId=req.params.reservationId;
   var status=req.body.status;
   pool.getConnection(function (err, conn) {
      if(err){
         err.code=500;
         return next(err);
      }
      console.log(reservationId+","+status);
      var sql='UPDATE reservation SET status=? WHERE id=?';  
      var params=[status,reservationId];
      conn.query(sql,params,function (err, results) {
         conn.release();
         res.send({msg:'success'});
      });
   });
}

function addReservation(req,res,next){
   var form = new formidable.IncomingForm();
   form.keepExtenstion = true;
   form.parse(req, function(err, fields, files) {
      if ( err ) {
         res.statusCode = 404;
         res.end('Error');
         return;
      }
   

      var userId=req.params.userId;
      var resDatetime=fields.resDatetime;
      var subject=fields.subject;
      var status=fields.status;
      var hospitalId=fields.hospitalId;

      pool.getConnection(function (err, conn) {
         if (err) {
            err.code = 500;
            return next(err);
         }
         console.log(userId+","+resDatetime+","+subject+","+status+","+hospitalId);
         var sql = 'INSERT INTO reservation(resDatetime,status,subject,userId,hospitalId) VALUES(?,?,?,?,?)';
         var params=[resDatetime,status,subject,userId,hospitalId];
         conn.query(sql,params, function (err, result) {
            res.send({ msg: 'success'});
            conn.release();
         });
      });
   });
}


function showGraphList(req, res, next) {
   var animalId=req.params.animalId;
   pool.getConnection(function (err, conn) {
      if (err) {
         err.code = 500;
         return next(err);
      }

      var sql = 'SELECT * FROM animals WHERE animalId=?';
      conn.query(sql,animalId, function (err, results) {
         if (err) {
            err.code = 500;
            conn.release();
            return next(err);
         }

         res.send({msg:'success',total:results.length,data:results});
         conn.release();
         
      });
   });
}

function showDogList(req, res, next) {
   var userId=req.params.userId;
   pool.getConnection(function (err, conn) {
      if(err){
         err.code=500;
         return next(err);
      }
      var sql='SELECT * FROM users WHERE id=?';
      
      
      conn.query(sql,userId,function(err,results){
         if(err){
            err.code=500;
            conn.release();
            return next(err);
         }
         var userInfo=results[0];
         var hospitalId=results[0].hospitalId;
         var sql2='SELECT id,name FROM hospital WHERE id=?';
         conn.query(sql2,hospitalId,function(err,results){
            if(err){
               err.code=500;
               conn.release();
               return next(err);
            }
            userInfo.hospital=results[0];
         });

         var sql3='SELECT * FROM animal WHERE userId=?';   
         conn.query(sql3,userId,function (err, results) {
            if(err){
               err.code=500;
               conn.release();
               return next(err);
            }
            userInfo.animals=results;


            res.send({msg:'success',result:userInfo});
            conn.release();
         });
      });
   });
}

function showDogSelect(req,res,next){
   var animalId=req.params.animalId;
   pool.getConnection(function (err, conn) {
      if(err){
         err.code=500;
         return next(err);
      }
      var sql='SELECT * FROM animal WHERE id=?';

      conn.query(sql,animalId,function (err, results) {
         if(err){
            err.code=500;
            conn.release();
            return next(err);
         }
         var dogList={
            result:results[0]
         };
         conn.release();
         res.send({msg:'success',result:results[0]});
      });
   });
}


function showDogImage(req,res,next){
   var parsed = url.parse(req.url);
   var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
   
   var path = __dirname + parsed.pathname;
   console.log(fullUrl);
   console.log("==="+path);
   fs.access(path, function(err) {
      if ( err ) {
         res.statusCode = 404;
         res.end('Not Found');
         return;
      }
      var is = fs.createReadStream(path);
      is.pipe(res);
   });   
   
}

function showDogs(req,res,next){
   var userId=req.params.userId;
   pool.getConnection(function (err, conn) {
      if(err){
         err.code=500;
         return next(err);
      }
      var sql='SELECT * FROM animal WHERE userId=?';

      conn.query(sql,userId,function (err, results) {
         if(err){
            err.code=500;
            conn.release();
            return next(err);
         }
         res.send({msg:'success',total:results.length,data:results});
         conn.release();
         
      });
   });
   
}

function showHospitalSelect(req,res,next){
   var userId=req.params.userId;
   var hospitalId=req.params.hospitalId;
   pool.getConnection(function(err,conn){
      if(err){
      err.code=500;
      return next(err);
      }
      var sql='SELECT * FROM hospital WHERE id=?';
      
      conn.query(sql,hospitalId,function(err,results){
         if(err){
            err.code=500;
            conn.release();
            return next(err);
         }
         var hospitalInfo=results[0];
         
         var sql2='SELECT * FROM vet WHERE hospitalId=?';   
         conn.query(sql2,hospitalId,function (err, results) {
            if(err){
               err.code=500;
               conn.release();
               return next(err);
            }
            hospitalInfo.vets=results;
            
         });

           
         var sql3='SELECT subject FROM subjects WHERE hospitalId=?';
         conn.query(sql3,hospitalId,function(err,results){
            if(err){
               err.code=500;
               conn.release();
               return next(err);
            }
            hospitalInfo.hospitalSubjects=results;
         });   

         var sql4='SELECT vacationDate FROM vacation WHERE hospitalId=?';
         conn.query(sql4,hospitalId,function(err,results){
            if(err){
               err.code=500;
               conn.release();
               return next(err);
            }
            hospitalInfo.hospitalVacations=results;
            
            res.send({msg:'success',result:hospitalInfo});
         });
         conn.release();   
      });
   });
}

function showMapList(req,res,next){
   pool.getConnection(function(err,conn){
      if(err){
         err.code=500;
         return next(err);
      }
      var lng=req.query.geoCordLng;
      var lat=req.query.geoCordLat;
      

      var sql='SELECT id,name,lng,lat,originalPhotoUrl,resizePhotoUrl,introduce,onOff FROM hospital ORDER BY SQRT(POW((lng - '+lng+'), 2) + POW((lat - '+lat+'), 2)) LIMIT 3';
      conn.query(sql,function(err,results){
         if(err){
            err.code=500;
            conn.release();
            return next(err);
         }

         res.send({msg:'success',total:results.length,data:results});
      });
   });

}


function showReservationList(req,res,next){
   var userId=req.params.userId;
   pool.getConnection(function(err,conn){
      if(err){
         err.code=500;
         return next(err);
      }
         
         var sql2='SELECT r.id,r.resDatetime,r.status,r.subject,h.name FROM reservation r,hospital h WHERE r.hospitalId=h.id and userId=?';
         conn.query(sql2,userId,function(err,results){
            if(err){
               err.code=500;
               conn.release();
               return next(err);
            }
            
            res.send({msg:'success',total:results.length,data:results});      
            conn.release();         
         });
         
      
   });
}


function showQnasList(req,res,next){
   var userId=req.params.userId;
   pool.getConnection(function(err,conn){
      if(err){
      err.code=500;
      return next(err);
      }
      var sql='SELECT q.id,q.question,q.createdAt,h.name FROM qnas q,hospital h WHERE h.id=q.hospitalId AND q.userId=? ORDER BY id DESC';
         
      conn.query(sql,userId,function(err,result){
         if(err){
            err.code=500;
            conn.release();
            return next(err);
         }

         res.send({msg:'success',total: result.length,data:result});
         conn.release();      
         
      });
   });
}


function showprescriptList(req,res,next){
   var animalId=req.params.animalId;
   pool.getConnection(function(err,conn){
      if(err){
      err.code=500;
      return next(err);
      }
      var sql='SELECT * FROM prescript WHERE animalId=?';
      
      conn.query(sql,animalId,function(err,result){
         if(err){
            err.code=500;
            conn.release();
            return next(err);
         }
         var presInfo=result;
         res.send({msg:'success',total:presInfo.length,data: presInfo});
         conn.release();
      });
   });  
}

function showQnaRList(req,res,next){
   var qnaMainId=req.params.qnaMainId;

   pool.getConnection(function(err,conn){
      if(err){
      err.code=500;
      return next(err);
      }

      var sql='SELECT * FROM qnas WHERE id=?';
      conn.query(sql,qnaMainId,function(err,result){
         if(err){
            err.code=500;
            conn.release();
            return next(err);
         }
         
         var sql2='SELECT * FROM qnarepeat WHERE qnaMainId=?';
         conn.query(sql2,qnaMainId,function(err,results){
            if(err){
               err.code=500;
               conn.release();
               return next(err);
            }
            result[0].qnaSubs=results;   
            
            
            res.send({msg:'success' ,result: result[0]});
            conn.release();   
            
         });
      });
   });
}
function showReservSelect(req,res,next){
   var reservationId=req.params.reservationId;
   pool.getConnection(function(err,conn){
      if(err){
      err.code=500;
      return next(err);
      }

      var sql='SELECT * FROM reservation WHERE id=?';
      conn.query(sql,reservationId,function(err,results){
         if(err){
            err.code=500;
            conn.release();
            return next(err);
         }
         res.send({msg:'success' ,result: results[0]});
         conn.release();
      });
   });
}

function showNotisList(req,res,next){
   var userId=req.params.userId;
   pool.getConnection(function(err,conn){
      if(err){
      err.code=500;
      return next(err);
      }

      var sql='SELECT * FROM notis WHERE userId=?';
      conn.query(sql,userId,function(err,results){
         if(err){
            err.code=500;
            conn.release();
            return next(err);
         }
         res.send({msg:'success' ,total:results.length,data: results});
         conn.release();
      });
   });
}

module.exports = router;
