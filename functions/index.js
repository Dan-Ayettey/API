const functions = require("firebase-functions");
const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");
const crypto=require('crypto');

admin.initializeApp();
const db = admin.firestore();
const app = express();
app.use(cors({ origin: true }));

// Get single user
app.post("/user/:id", async (request, response) => {

  const userCollectionRef = db.collection("users");
  const result = await userCollectionRef.doc(request.params.id).get();

  const id = result.id;
  const user = result.data();

  response.status(200).send({ id, ...user });
});

//renew password
app.put("/renew-password/:id", async (request, response) => {
  const userCollectionRef = db.collection("users");
  const result = await userCollectionRef.doc(request.params.id).get();

  const id = result.id;
  const user = result.data();

  response.status(200).send({ id, ...user });
});

//all users

app.post("/users", async (request, response) => {
  const userCollectionRef = db.collection("users");
  const result = await userCollectionRef.get();

  let users = [];
  result.forEach((userDoc) => {

    const id = userDoc.id;
    const data = userDoc.data();

    users.push({ id:id, users:data,isAvailable:true });
  });

  response.status(200).send(users);
});

// Update user
app.put("/user/:id", async (request, response) => {
  const id=[null,'',undefined].includes(request.body.id)?request.params.id:request.body.id;
 request.body.id=id;
 const body=request.body;

  try {
    const userCollectionRef = db.collection("users");
    const result = await userCollectionRef
      .doc(id)
      .update(body);
   response.status(200).json({id:result.id,isUpdated:true});
   } catch (e) {
    response.status(404).json({msg:e.message,isUpdated:false});

   }
});

// Create user
app.post("/user", async (request, response) => {
  const newUser = request.body;
  newUser.password=crypto.createHmac('sha256',newUser.password).update(newUser.password.toString()).digest('hex');

  try {

   const userCollectionRef = db.collection("users");
   const result = await userCollectionRef.add(newUser);
  response.status(200).json({id:result.id,isCreated:true});
  } catch (e) {
      response.status(409).json({msg:e.message,isCreated:false});

  }



});

// Delete user
app.delete("/user/:id", async (request, response) => {

  try {
  const id=[null,'',undefined].includes(request.body.id)?request.params.id:request.body.id;
  const userCollectionRef = db.collection("users");

  const result = await userCollectionRef.doc(id).delete();
   response.status(200).json({id:result.id,isDeleted:true});
   } catch (e) {
    response.status(404).json({msg:e.message,isDeleted:false});

   }

});

exports.app = functions.https.onRequest(app);
