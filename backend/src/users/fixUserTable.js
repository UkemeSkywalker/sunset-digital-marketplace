const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    // Get all users from the table
    const scanParams = {
      TableName: process.env.USERS_TABLE
    };
    
    const result = await dynamodb.scan(scanParams).promise();
    const users = result.Items;
    
    console.log(`Found ${users.length} users in the table`);
    
    // Check if there's a user with id "undefined"
    const badUser = users.find(user => user.id === "undefined");
    
    if (badUser) {
      console.log("Found bad user with id 'undefined'. Deleting it...");
      
      // Delete the bad user
      const deleteParams = {
        TableName: process.env.USERS_TABLE,
        Key: { id: "undefined" }
      };
      
      await dynamodb.delete(deleteParams).promise();
      console.log("Bad user deleted successfully");
    } else {
      console.log("No bad user found");
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'User table fixed successfully' })
    };
  } catch (error) {
    console.error('Error fixing user table:', error);
    return {
      statusCode: error.statusCode || 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Error fixing user table', error: error.message })
    };
  }
};