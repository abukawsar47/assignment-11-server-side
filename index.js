const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lcmpo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const carCollection = client.db('carDealer').collection('car')

        app.get('/car', async (req, res) => {
            const query = {};
            const cursor = carCollection.find(query);
            const cars = await cursor.toArray();
            res.send(cars);
        })

        app.get('/car/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            console.log(query);
            const car = await carCollection.findOne(query);
            res.send(car);
        })

        // =================
        /*      app.get('/car', async (req, res) => {
                 const query = {};
                 const cursor = carCollection.find(query);
                 const supplierInfo = await cursor.toArray();
                 res.send(supplierInfo);
             }); */
        // ==================


        //POST
        app.post('/car', async (req, res) => {
            const newCar = req.body;
            const result = await carCollection.insertOne(newCar);
            res.send(result);
        })

        //DELETE
        app.delete('/car/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await carCollection.deleteOne(query);
            res.send(result);
        })

        //PUT
        app.put('/car/:id', async (req, res) => {
            const id = req.params.id;
            const updateCar = req.body;
            const query = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: updateCar.quantity
                }
            };
            const result = await carCollection.updateOne(query, updateDoc, options);
            res.send(result);
        })
        // verifyJWT
        app.get('/car', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = carCollection.find(query);
                const cars = await cursor.toArray();
                res.send(cars);
            }
            else {
                return res.status(403).send({ message: 'Forbidden Access' })
            }
        })
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

    }
    finally {

    }
}

run().catch(console.dir);


//To check is it working
app.get('/', (req, res) => {
    res.send('Running Server');
});

//listen
app.listen(port, () => {
    console.log('Listening to port', port);
})