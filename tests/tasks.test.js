const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const Task=require('../src/models/task')
const {userTest,taskOne,userTest2, setUpDatabase, taskTwo, taskThree}=require('./fixtures/db')


beforeEach(setUpDatabase);


test('create task for user',async()=>{
    const response= await request(app).post('/tasks')
    .set('Authorization',`Bearer ${userTest.tokens[0].token}`)
    .send({
        description:'hello task',
        owner:userTest._id
    })
    .expect(201)

    const task=await Task.findById(response.body._id);
    expect(task).not.toBeNull();
})

test('Should not create task with invalid description/completed',async()=>{
    const response= await request(app).post('/tasks')
    .set('Authorization',`Bearer ${userTest.tokens[0].token}`)
    .send({
        description:"hello",
        completed:"bhgcf",
        owner:userTest._id
    })
    .expect(400)
})

test('Should not update task with invalid description/completed',async()=>{
    await request(app).patch(`/tasks/${taskOne._id}`)
    .set('Authorization',`Bearer ${userTest.tokens[0].token}`)
    .send({
        completed:"hjghf"
    })
    .expect(500)
})


test('get task for user one',async()=>{
    const response= await request(app).get('/tasks')
    .set('Authorization',`Bearer ${userTest.tokens[0].token}`)
    .expect(200)

    const tasks=await Task.find({owner:userTest._id});
    expect(tasks.length).toBe(response.body.total)
})

test('delete other user tasks',async()=>{
    await request(app).delete(`/tasks/${taskOne._id}`)
    .set('Authorization',`Bearer ${userTest2.tokens[0].token}`)
    .send()
    .expect(400)
})

test('Should fetch user task by id',async()=>{
    const response= await request(app).get(`/tasks/${taskOne._id}`)
    .set('Authorization',`Bearer ${userTest.tokens[0].token}`)
    .expect(200)
})

test('Should not fetch user task by id if unauthenticated',async()=>{
    const response= await request(app).get(`/tasks/${taskOne._id}`)
    .expect(401)
})

test('Should not fetch other user task by id',async()=>{
    const response= await request(app).get(`/tasks/${taskOne._id}`)
    .set('Authorization',`Bearer ${userTest2.tokens[0].token}`)
    .expect(400)
})
