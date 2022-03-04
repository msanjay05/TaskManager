const express = require("express");
const User = require("../models/user");
const auth=require('../middleware/auth')
const multer=require('multer');
const sharp=require('sharp')
const {sendWelcomeEmail, sendAccountDeleteEmail}=require('../emails/account');
const router = new express.Router();

// router.post("/users", async (req, res) => {
//   const user = new User(req.body);
//   try {
//     await user.save();
//     res.status(201).send(user);
//   } catch (e) {
//     res.status(400).send(e);
//   }
//   // user.save().then(()=>{
//   //     res.status(201).send(user)
//   // }).catch((e)=>{
//   //     res.status(400).send(e);
//   // });
// });


// create user or signup
router.post("/users", async (req, res) => {
  let user = new User(req.body);
  try {
    await user.save();
    // sendWelcomeEmail(user.phone,user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

// logout
router.post('/users/logout',auth, async(req,res)=>{
  try {
    req.user.tokens=req.user.tokens.filter((token)=>{
      return token.token!== req.token;
    })
    await req.user.save();
    res.send({message:'logged out successfully'});
  } catch (error) {
    res.status(500).send({error:'please login first'})
  }
})


// logout from all device
router.post('/users/logoutall',auth, async(req,res)=>{
  try {
    req.user.tokens=[];
    await req.user.save();
    res.send({message:'logged out successfully'});
  } catch (e) {
    res.status(500).send({error:'please login first'})
  }
})

// login
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.phoneNo,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send({error:'password or phoneNo is wrong'});
  }
});


// get user details
router.get("/user/me",auth, async (req, res) => {
  res.send(req.user)
});


// update user
router.patch("/users/me", auth,async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "phoneNo", "age", "password"];
  const isAllowed = updates.every((update) => {
    return allowedUpdates.includes(update);
  });
  if (!isAllowed) {
    return res
      .status(400)
      .send({ error: "Fields you are trying to update can't be updated" });
  }
  try {
    updates.forEach((update) => {
      req.user[update] = req.body[update];
    });
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});


// delete user
router.delete("/users/me",auth, async (req, res) => {
  try {
    await req.user.remove();
    // sendAccountDeleteEmail(req.user.email,req.user.name)
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});


const upload=multer({
  // dest:'avatars',
  limits:{
    fileSize:1000000
  },
  fileFilter(req,file,cb){
    if(!file.originalname.match(/\.(jpeg|jpg|png)$/)){
      return cb(new Error('please upload only jpeg or jpg or png images'));
    }
    cb(undefined,true)
  }
})

// upload profile picture
router.post('/users/me/avatar',auth,upload.single('avatar'),async(req,res)=>{
  const buffer=await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
  req.user.avatar=buffer;
  await req.user.save();
  res.send({message:'uploaded successfully'});
},(error,req,res,next)=>{
  res.status(400).send({error:error.message})
})

// delete profile picture
router.delete('/users/me/avatar',auth,upload.single('avatar'),async(req,res)=>{
  req.user.avatar=undefined;
  await req.user.save();
  res.send({message:'deleted successfully'});
},(error,req,res,next)=>{
  res.status(400).send({error:error.message})
})

// get profile picture
router.get('/users/:id/avatar',async(req,res)=>{
  try {
    const user=await User.findById(req.params.id);
    if(!user || !user.avatar)
    {
      throw new Error();
    }
    res.set('Content-type','image/png');
    res.send(user.avatar);
  } catch (e) {
    res.status(400).send();
  }
})

module.exports = router;
