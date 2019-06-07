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
    res.send("Health check: Video Stream API active.");
});

app.post('/', async (req, res) => {
    console.log(req.body);
    res.send(req.body);
});

app.get('/stream/:video', async (req, res) => {
    let videoParams = {
        Bucket: BUCKET_NAME,
        Key: req.params.video,
    };
    S3.getObject(videoParams)
      .on('httpHeaders', function (statusCode, headers) {
          res.set('Content-Length', headers['content-length']);
          res.set('Content-Type', headers['content-type']);
          this.response.httpResponse.createUnbufferedStream()
              .pipe(res);
    })
    .send();
});

app.listen(process.env.PORT || 80);
console.log("Video Stream API is running.");