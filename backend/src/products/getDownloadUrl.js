const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3({
  region: 'us-east-1',
  signatureVersion: 'v4'
});

// Helper function to extract file extension
function getFileExtension(filename) {
  const match = filename.match(/\.[0-9a-z]+$/i);
  return match ? match[0] : '';
}

module.exports.handler = async (event) => {
  try {
    // Get product ID from path parameters
    const productId = event.pathParameters.id;
    
    // Get product details from DynamoDB
    const params = {
      TableName: process.env.PRODUCTS_TABLE,
      Key: { id: productId }
    };
    
    const result = await dynamodb.get(params).promise();
    const product = result.Item;
    
    if (!product) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Product not found' })
      };
    }
    
    // Check if product has a file key or image key
    let fileKey = product.fileKey || product.imageKey;
    
    if (!fileKey) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Product has no downloadable file' })
      };
    }
    
    // Add 'public/' prefix if it's not already there
    if (!fileKey.startsWith('public/')) {
      fileKey = `public/${fileKey}`;
    }
    
    console.log('Attempting to download file with key:', fileKey);
    
    // Generate pre-signed URL for downloading the file
    const s3Params = {
      Bucket: process.env.PRODUCT_BUCKET,
      Key: fileKey,
      Expires: 60 * 5, // URL expires in 5 minutes
      ResponseContentDisposition: `attachment; filename="${product.name.replace(/[^a-zA-Z0-9._-]/g, '_')}${getFileExtension(fileKey)}"` // Set filename for download
    };
    
    const downloadUrl = s3.getSignedUrl('getObject', s3Params);
    console.log('Generated download URL:', downloadUrl);
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ downloadUrl })
    };
  } catch (error) {
    console.log('Error generating download URL:', error);
    return {
      statusCode: error.statusCode || 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Could not generate download URL', error: error.message })
    };
  }
};