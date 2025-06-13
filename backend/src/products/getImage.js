const AWS = require('aws-sdk');
const s3 = new AWS.S3();

module.exports.handler = async (event) => {
  try {
    // Get the image key from the path parameter
    const imageKey = decodeURIComponent(event.pathParameters.key);
    
    // Get the image from S3
    const params = {
      Bucket: process.env.PRODUCT_BUCKET,
      Key: imageKey
    };
    
    const data = await s3.getObject(params).promise();
    
    // Return the image with appropriate content type
    return {
      statusCode: 200,
      headers: {
        'Content-Type': data.ContentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
      },
      body: data.Body.toString('base64'),
      isBase64Encoded: true
    };
  } catch (error) {
    console.log('Error getting image:', error);
    return {
      statusCode: error.statusCode || 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Could not get image', error: error.message })
    };
  }
};