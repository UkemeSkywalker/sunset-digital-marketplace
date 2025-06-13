const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

module.exports.handler = async (event) => {
  try {
    const productId = event.pathParameters.id;
    
    // Get the product first to get the file keys
    const result = await dynamodb.get({
      TableName: process.env.PRODUCTS_TABLE,
      Key: { id: productId }
    }).promise();
    
    const product = result.Item;
    
    if (!product) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'Product not found' })
      };
    }
    
    // Delete files from S3 if they exist
    const deletePromises = [];
    
    if (product.fileKey) {
      deletePromises.push(
        s3.deleteObject({
          Bucket: process.env.PRODUCT_BUCKET,
          Key: product.fileKey
        }).promise()
      );
    }
    
    if (product.imageKey) {
      deletePromises.push(
        s3.deleteObject({
          Bucket: process.env.PRODUCT_BUCKET,
          Key: product.imageKey
        }).promise()
      );
    }
    
    // Wait for S3 deletions to complete
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises);
    }
    
    // Delete from DynamoDB
    await dynamodb.delete({
      TableName: process.env.PRODUCTS_TABLE,
      Key: { id: productId }
    }).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Product deleted successfully' })
    };
  } catch (error) {
    console.log('Error deleting product:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Could not delete product', error: error.message })
    };
  }
};