const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const AWS = require('aws-sdk');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const uuid = require('uuid/v4');

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

app.get('/health', (req, res) => {
    res.send("Health check: Video Stream API active.");
});

app.post('/', (req, res) => {
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

app.get('/stream/:video/thumbnails', async (req, res) => {
    let videoParams = {
        Bucket: BUCKET_NAME,
        Key: req.params.video,
    };
    let dir = './thumbnails/' + req.params.video;
    if(!fs.exists(dir, err => { console.log(err) })){
        fs.mkdir(dir, err => { console.log(err) });
    }
    let stream = S3.getObject(videoParams).createReadStream();
    ffmpeg(stream).takeScreenshots({ count: 3, timemarks: [ '00:00:02.000', '6', '10' ]}, dir)
    .on('end', () => {
        res.send(true);
    })
    .on('error', (err) => {
        console.log(err);
    });
});

app.get('/stream/:video/get-thumbnails', (req, res) => {
    let dir = './thumbnails/' + req.params.video;
    const filenames = fs.readdirSync(dir, (err) => { console.log(err); });
    let content = fs.readFileSync(dir + '/' + filenames[0], (err) => { console.log(err); });
    fs.unlinkSync(dir + '/' + filenames[0], (err) => { console.log(err); })
    res.set('Content-Type', 'image/png');
    res.send(content);
});

app.get('/stream/:video/thumbnail-selected', (req, res) => {
    let dir = './thumbnails/' + req.params.video;
    fs.rmdirSync(dir);
    res.send(true);
});

app.listen(process.env.PORT || 9000);
console.log("Video Stream API is running.");