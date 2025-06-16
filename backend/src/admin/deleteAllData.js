const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    // 1. Delete all users
    console.log("Deleting all users...");
    const usersResult = await dynamodb.scan({
      TableName: process.env.USERS_TABLE
    }).promise();
    
    for (const user of usersResult.Items) {
      await dynamodb.delete({
        TableName: process.env.USERS_TABLE,
        Key: { id: user.id }
      }).promise();
      console.log(`Deleted user ${user.id}`);
    }
    
    // 2. Delete all products
    console.log("Deleting all products...");
    const productsResult = await dynamodb.scan({
      TableName: process.env.PRODUCTS_TABLE
    }).promise();
    
    for (const product of productsResult.Items) {
      await dynamodb.delete({
        TableName: process.env.PRODUCTS_TABLE,
        Key: { id: product.id }
      }).promise();
      console.log(`Deleted product ${product.id}`);
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ 
        message: 'All data deleted successfully',
        usersDeleted: usersResult.Items.length,
        productsDeleted: productsResult.Items.length
      })
    };
  } catch (error) {
    console.error('Error deleting data:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Error deleting data', error: error.message })
    };
  }
};