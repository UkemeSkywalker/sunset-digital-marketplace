const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const { userId, products, totalAmount } = data;
    
    const orderId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const order = {
      id: orderId,
      userId,
      products,
      totalAmount,
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    await dynamodb.put({
      TableName: process.env.ORDERS_TABLE,
      Item: order
    }).promise();
    
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(order)
    };
  } catch (error) {
    console.log('Error creating order:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Could not create order' })
    };
  }
};