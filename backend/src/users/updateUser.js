const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  try {
    const userId = event.pathParameters.id;
    const data = JSON.parse(event.body);
    const { 
      firstName, 
      lastName, 
      email, 
      organization, 
      country, 
      website, 
      socialMedia, 
      bio, 
      profilePicture 
    } = data;
    
    const timestamp = new Date().toISOString();
    
    // Update user in DynamoDB
    const params = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      UpdateExpression: 'set firstName = :firstName, lastName = :lastName, email = :email, organization = :organization, country = :country, website = :website, socialMedia = :socialMedia, bio = :bio, profilePicture = :profilePicture, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':firstName': firstName,
        ':lastName': lastName,
        ':email': email,
        ':organization': organization,
        ':country': country,
        ':website': website,
        ':socialMedia': socialMedia,
        ':bio': bio,
        ':profilePicture': profilePicture,
        ':updatedAt': timestamp
      },
      ReturnValues: 'ALL_NEW'
    };
    
    const result = await dynamodb.update(params).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(result.Attributes)
    };
  } catch (error) {
    console.log('Error updating user:', error);
    return {
      statusCode: error.statusCode || 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Could not update user', error: error.message })
    };
  }
};