const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    const { name, description, price, category, fileKey, imageKey, sellerId, status } = data;
    
    const productId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Generate S3 URLs for the files
    const s3Bucket = process.env.PRODUCT_BUCKET;
    let imageUrl = null;
    
    if (imageKey) {
      imageUrl = `https://${s3Bucket}.s3.amazonaws.com/${imageKey}`;
    }
    
    const product = {
      id: productId,
      name,
      description,
      price,
      category,
      fileKey,
      imageKey,
      imageUrl,
      sellerId,
      status: status || 'active',
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
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'
      },
      body: JSON.stringify(product)
    };
  } catch (error) {
    console.log('Error creating product:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'
      },
      body: JSON.stringify({ message: 'Could not create product', error: error.message })
    };
  }
};