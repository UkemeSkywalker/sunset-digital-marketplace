# Sunset Digital Marketplace

A serverless digital marketplace built with AWS services for selling and purchasing digital products.

## Architecture

This project uses a serverless architecture with the following components:

- **Frontend**: React.js application with AWS Amplify for authentication
- **Backend**: AWS Lambda functions with API Gateway
- **Database**: Amazon DynamoDB for storing products, users, and orders
- **Storage**: Amazon S3 for storing digital product files
- **Authentication**: Amazon Cognito for user management and authentication

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- AWS CLI configured with appropriate credentials
- Serverless Framework CLI

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Deploy the backend:
   ```
   serverless deploy --stage dev
   ```

4. After deployment, note the API Gateway endpoint URL and Cognito User Pool details.

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Update the `.env` file with your backend details:
   ```
   REACT_APP_API_URL=https://your-api-gateway-url.execute-api.us-east-1.amazonaws.com/dev
   REACT_APP_USER_POOL_ID=us-east-1_xxxxxxxx
   REACT_APP_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. Start the development server:
   ```
   npm start
   ```

## Features

- User authentication (sign up, sign in, sign out)
- Browse digital products
- Product details view
- Purchase products
- Order history
- Seller dashboard for managing products

## Project Structure

```
sunset-digital-marketplace/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── products/
│   │   └── orders/
│   └── serverless.yml
└── frontend/
    ├── public/
    └── src/
        ├── components/
        ├── context/
        └── pages/
```

## License

This project is licensed under the MIT License.