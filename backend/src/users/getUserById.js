const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  try {
    // Log the incoming request for debugging
    console.log('Event:', JSON.stringify(event));
    
    // Get the user ID from the path parameters
    const userId = event.pathParameters.id;
    console.log('Looking up user with ID:', userId);
    
    // Check if the user ID is valid
    if (!userId || userId === 'undefined') {
      console.log('Invalid user ID:', userId);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'Invalid user ID' })
      };
    }
    
    // Query the database for the user
    const params = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId }
    };
    
    const result = await dynamodb.get(params).promise();
    const user = result.Item;
    
    // Log the result for debugging
    console.log('Database result:', JSON.stringify(result));
    
    if (!user) {
      console.log('User not found for ID:', userId);
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'User not found' })
      };
    }
    
    // Return the user data
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(user)
    };
  } catch (error) {
    console.log('Error getting user:', error);
    return {
      statusCode: error.statusCode || 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Could not get user', error: error.message })
    };
  }
};