const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const { id, email } = data;
    
    if (!id) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'User ID is required' })
      };
    }
    
    const timestamp = new Date().toISOString();
    
    // Check if user already exists
    const getParams = {
      TableName: process.env.USERS_TABLE,
      Key: { id }
    };
    
    const existingUser = await dynamodb.get(getParams).promise();
    
    if (existingUser.Item) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(existingUser.Item)
      };
    }
    
    // Create new user
    const user = {
      id,
      email,
      username: email.split('@')[0], // Default username from email
      firstName: '',
      lastName: '',
      organization: '',
      country: '',
      website: '',
      socialMedia: {
        twitter: '',
        instagram: '',
        linkedin: ''
      },
      bio: '',
      profilePicture: null,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    const params = {
      TableName: process.env.USERS_TABLE,
      Item: user
    };
    
    await dynamodb.put(params).promise();
    
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
      statusCode: error.statusCode || 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Could not create user', error: error.message })
    };
  }
};