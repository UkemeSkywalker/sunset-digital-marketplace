const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const { email, name } = data;
    
    const userId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const user = {
      id: userId,
      email,
      name,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    await dynamodb.put({
      TableName: process.env.USERS_TABLE,
      Item: user
    }).promise();
    
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(user)
    };
  } catch (error) {
    console.log('Error creating user:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Could not create user' })
    };
  }
};