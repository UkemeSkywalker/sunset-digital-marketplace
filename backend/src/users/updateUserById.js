const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

module.exports.handler = async (event) => {
  try {
    // Log the incoming request for debugging
    console.log('Event:', JSON.stringify(event));
    
    const userId = event.pathParameters.id;
    console.log('Updating user with ID:', userId);
    
    // Check if the user ID is valid
    if (!userId || userId === 'undefined') {
      console.log('Invalid user ID:', userId);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'Invalid user ID' })
      };
    }
    
    const data = JSON.parse(event.body);
    const { 
      firstName, 
      lastName, 
      email,
      username,
      organization, 
      country, 
      website, 
      socialMedia, 
      bio, 
      profilePicture 
    } = data;
    
    // Verify that the user ID in the path matches the ID in the body
    if (data.id && data.id !== userId) {
      console.log('User ID mismatch. Path:', userId, 'Body:', data.id);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'User ID mismatch' })
      };
    }
    
    // Check if the user exists
    const getParams = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId }
    };
    
    const existingUser = await dynamodb.get(getParams).promise();
    
    if (!existingUser.Item) {
      console.log('User not found for ID:', userId);
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ message: 'User not found' })
      };
    }
    
    const timestamp = new Date().toISOString();
    
    const params = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId },
      UpdateExpression: 'set firstName = :firstName, lastName = :lastName, email = :email, username = :username, organization = :organization, country = :country, website = :website, socialMedia = :socialMedia, bio = :bio, profilePicture = :profilePicture, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':firstName': firstName,
        ':lastName': lastName,
        ':email': email,
        ':username': username,
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