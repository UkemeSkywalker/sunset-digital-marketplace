const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const { name, description, price, imageUrl, sellerId } = data;
    
    const productId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const product = {
      id: productId,
      name,
      description,
      price,
      imageUrl,
      sellerId,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    await dynamodb.put({
      TableName: process.env.PRODUCTS_TABLE,
      Item: product
    }).promise();
    
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(product)
    };
  } catch (error) {
    console.log('Error creating product:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Could not create product' })
    };
  }
};