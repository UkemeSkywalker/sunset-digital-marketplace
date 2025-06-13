const AWS = require('aws-sdk');
const s3 = new AWS.S3();

module.exports.handler = async (event) => {
  try {
    const { fileName, contentType } = JSON.parse(event.body);
    
    if (!fileName || !contentType) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'fileName and contentType are required' })
      };
    }
    
    // Generate a pre-signed URL for uploading
    const params = {
      Bucket: process.env.PRODUCT_BUCKET,
      Key: fileName,
      ContentType: contentType,
      Expires: 3600 // URL expires in 1 hour
    };
    
    const uploadURL = await s3.getSignedUrlPromise('putObject', params);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        uploadURL,
        key: fileName
      })
    };
  } catch (error) {
    console.log('Error generating upload URL:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Could not generate upload URL', error: error.message })
    };
  }
};