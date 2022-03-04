const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const {userTest,userTestId, setUpDatabase}=require('./fixtures/db')


beforeEach(setUpDatabase);

// afterEach(() => {
//   console.log("afterEach");
// });

test("should sign up", async () => {
  const response=await request(app)
    .post("/users")
    .send({
      name: "Sanjay",
      email: "sanjay3@gmail.com",
      password: "Sanjay@123",
    })
    .expect(201);

    // user save to db correctly
    const user=await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    // assertion about response
    expect(response.body).toMatchObject({
        user:{
            name:"Sanjay",
            email:"sanjay3@gmail.com"
        },
        token:user.tokens[0].token
    })

    expect(user.password).not.toBe("Sanjay@123")
});

test("should not signup with invalid details", async()=>{
    await request(app)
    .post("/users")
    .send({
        name: "Sanjay",
        email: "sanjaygmail.com",
        password: "Sanjay@123",
      })
      .expect(400);


})

test("should sign in", async () => {
  const response= await request(app)
    .post("/users/login")
    .send({
      email: userTest.email,
      password: userTest.password,
    })
    .expect(200);

    const user=await User.findById(userTestId);
    expect(user).not.toBeNull();
    expect(response.body.token).toBe(user.tokens[1].token)
});

test("sign in failure", async () => {
  await request(app)
    .post("/users/login")
    .send({
      email: userTest.email,
      password: "sanjay@1234",
    })
    .expect(400);
});

test("get user Profile", async () => {
    await request(app)
        .get("/user/me")
        .set('Authorization',`Bearer ${userTest.tokens[0].token}`)
        .send()
        .expect(200)
})

test("not get user Profile", async () => {
    await request(app)
        .get("/user/me")
        .send()
        .expect(401)
})

test("delete user Profile", async () => {
    await request(app)
        .delete("/users/me")
        .set('Authorization',`Bearer ${userTest.tokens[0].token}`)
        .send()
        .expect(200)
    const user=await User.findById(userTestId);
    expect(user).toBeNull()
})

test("not delete user Profile", async () => {
    await request(app)
        .delete("/users/me")
        .send()
        .expect(401)
})

test("upload profile picture", async () => {
    await request(app)
        .post("/users/me/avatar")
        .set('Authorization',`Bearer ${userTest.tokens[0].token}`)
        .attach('avatar','tests/fixtures/profile-pic.jpg')
        .expect(200)
    
    const user=await User.findById(userTestId);
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test("update valid user fields", async () => {
    await request(app)
        .patch("/users/me")
        .set('Authorization',`Bearer ${userTest.tokens[0].token}`)
        .send({
            name:"sanjay kumar"
        })
        .expect(200)
    
    const user=await User.findById(userTestId);
    expect(user.name).toBe("sanjay kumar")
})

test("update invalid user fields", async () => {
    await request(app)
        .patch("/users/me")
        .set('Authorization',`Bearer ${userTest.tokens[0].token}`)
        .send({
            location:"sanjay kumar"
        })
        .expect(400)
})

test("Should not update user if unauthenticated", async () => {
    await request(app)
        .patch("/users/me")
        .send({
            name:"sanjay kumar"
        })
        .expect(401)
})

test("Should not update user with invalid name/email/password", async () => {
    await request(app)
        .patch("/users/me")
        .set('Authorization',`Bearer ${userTest.tokens[0].token}`)
        .send({
            name:""
        })
        .expect(500)
})