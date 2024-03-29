const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const AWS = require('aws-sdk');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const config = require('./config.json');

const env = process.env.PROJECTENV;

const currentENV = () => {
    if(!env){
        return 'development';
    }
    return env
}

AWS.config.update({
    accessKeyId: process.env.NUREN_S3_IAM,
    secretAccessKey: process.env.NUREN_S3_IAM_SECRET,
    region: 'us-east-2'
});
const S3 = new AWS.S3();

const app = express();
const BUCKET_NAME = config.env[currentENV()].bucket;

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
    let data = [];
    if(!fs.exists(dir, err => { console.log(err) })){
        fs.mkdir(dir, err => { console.log(err) });
    }
    let stream = S3.getObject(videoParams).createReadStream();
    ffmpeg(stream).takeScreenshots({ count: 3, timemarks: [ '2', '6', '10' ]}, dir)
    .on('end', () => {
        const filenames = fs.readdirSync(dir, (err) => { console.log(err); });
        filenames.forEach(file => {
            let content = fs.readFileSync(dir + '/' + file, (err) => { console.log(err); });
            let contentString = new Buffer.from(content).toString('base64');
            let imageString = 'data:image/png;base64,' + contentString;
            data.push(imageString);
            fs.unlinkSync(dir + '/' + file, (err) => { console.log(err); })
        });
        res.set('Content-Type', 'image/png');
        res.send(data);
    })
    .on('error', (err) => {
        console.log(err);
        res.send(false);
    });
});

app.get('/stream/:video/thumbnail-selected', (req, res) => {
    let dir = './thumbnails/' + req.params.video;
    if(!fs.exists(dir, err => { console.log(err) })){
        fs.rmdirSync(dir);
    }
    res.send(true);
});

const currentPORT = () => {
    if(env === 'development' || env === 'dev'){
        return '8000';
    }
    return '80'
}

app.listen(currentPORT());
console.log("Video Stream API is running.", process.env.PROJECTENV, BUCKET_NAME);