const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  try {
    // Get user ID from the Cognito authorizer context
    const userId = event.requestContext.authorizer.claims.sub;
    
    const result = await dynamodb.query({
      TableName: process.env.ORDERS_TABLE,
      IndexName: 'userIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(result.Items)
    };
  } catch (error) {
    console.log('Error getting orders:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Could not fetch orders' })
    };
  }
};