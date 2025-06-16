const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  try {
    // Get user attributes from the event
    const userId = event.request.userAttributes.sub;
    const email = event.request.userAttributes.email;
    const name = event.request.userAttributes.name || '';
    
    // Generate a default username from email
    const defaultUsername = email.split('@')[0];
    
    // Create timestamp for uniqueness
    const timestamp = new Date().toISOString();
    
    // Check if user already exists in our database
    const getParams = {
      TableName: process.env.USERS_TABLE,
      Key: { id: userId }
    };
    
    const existingUser = await dynamodb.get(getParams).promise();
    
    // If user doesn't exist, create a new user record
    if (!existingUser.Item) {
      const user = {
        id: userId,
        email: email,
        username: defaultUsername,
        firstName: name.split(' ')[0] || '',
        lastName: name.split(' ').slice(1).join(' ') || '',
        organization: '',
        country: '',
        website: '',
        socialMedia: {
          twitter: '',
          instagram: '',
          linkedin: ''
        },
        bio: '',
        profilePicture: null,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      const params = {
        TableName: process.env.USERS_TABLE,
        Item: user
      };
      
      await dynamodb.put(params).promise();
      console.log(`User ${userId} created successfully`);
    } else {
      console.log(`User ${userId} already exists`);
    }
    
    // Return the event to continue the flow
    return event;
  } catch (error) {
    console.error('Error in post confirmation:', error);
    // Still return the event to allow the user to be confirmed
    return event;
  }
};