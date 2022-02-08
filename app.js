const express = require('express');
const AWS = require('aws-sdk');

const app = express();
app.use(express.json());



//Config AWS
const creds = new AWS.SharedIniFileCredentials({profile: 'default'});
const sqs = new AWS.SQS({creds,region: 'us-east-1'});
const queueURL = "https://sqs.us-east-1.amazonaws.com/123191721163/assignmentQueue";




app.post('/send' , (req,res)=>{
    let params ={
        DelaySeconds: 10,
        MessageAttributes: {
          "Title": {
            DataType: "String",
            StringValue: `${req.params.title}`
          },
          "Author": {
            DataType: "String",
            StringValue: `${req.params.author}`
          },
          "WeeksOn": {
            DataType: "Number",
            StringValue: "6"
          }
        },
        MessageBody: `${req.params.message}`,
        
        QueueUrl: `${queueURL}`
    }

    sqs.sendMessage(params, function(err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          res.status(200).send(data);
        }
      });
      
});




;

app.get('/receive' , (req , res) =>{

    let params = {
        AttributeNames: [
           "SentTimestamp"
        ],
        MaxNumberOfMessages: 10,
        MessageAttributeNames: [
           "All"
        ],
        QueueUrl: `${queueURL}`,
        VisibilityTimeout: 20,
        WaitTimeSeconds: 0
       }

    sqs.receiveMessage(params, function(err, data) {
        if (err) {
          console.log("Receive Error", err);
        } else if (data.Messages) {
            
          let deleteParams = {
            QueueUrl: `${queueURL}`,
            ReceiptHandle: data.Messages[0].ReceiptHandle
          };
          
          sqs.deleteMessage(deleteParams, function(err, data) {
            if (err) {
              console.log("Delete Error", err);
            } else {
               res.send({
                   "status":200,
                   "data" : data
               });
            }
          });
          
        }
      });

});


const port = 3000;
app.listen(port , ()=>{
    console.log(`SNS app listening on port ${port}`);
});