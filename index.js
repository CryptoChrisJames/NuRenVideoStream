const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: process.env.NUREN_S3_IAM,
    secretAccessKey: process.env.NUREN_S3_IAM_SECRET,
    region: 'us-east-2'
});
const S3 = new AWS.S3();

const app = express();
const BUCKET_NAME = 'nurenproductions.com';

app.use(bodyParser.json());
app.use(cors());

app.get('/health', async (req, res) => {
    res.send("Health check: Main API active.");
});

app.post('/', async (req, res) => {
    console.log(req.body);
    res.send(req.body);
});

app.post('/stream/:video', async (req, res) => {
    let videoParams = {
        Bucket: BUCKET_NAME,
        Key: req.params.video,
    };
    S3.getObject(videoParams, (err, data) => {
        if(err){
            console.log(err);
        }
        console.log(data);
    });
    res.send("ok");
});

app.listen(process.env.PORT || 8678);
console.log("Api running");