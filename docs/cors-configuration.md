# CORS Configuration for Urbex API

## 🚨 **CURRENT ISSUE**
The frontend deployed at `https://d2i14zgn3xm1xu.cloudfront.net` is being blocked by CORS policy when trying to access the API at `https://eo6cj32bch.execute-api.us-east-2.amazonaws.com/prod/api/v1`.

## 🔧 **REQUIRED CORS HEADERS**

The backend needs to include these headers in all responses:

```
Access-Control-Allow-Origin: https://d2i14zgn3xm1xu.cloudfront.net
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: Content-Type, x-api-key, api-key, Authorization
Access-Control-Allow-Credentials: true
```

## 📋 **CONFIGURATION OPTIONS**

### Option 1: API Gateway CORS (Recommended)
If using AWS API Gateway, configure CORS in the API Gateway console:

1. Go to API Gateway Console
2. Select your API: `eo6cj32bch`
3. Go to Resources
4. Select the resource (e.g., `/admin/users`)
5. Click "Actions" → "Enable CORS"
6. Configure:
   - Access-Control-Allow-Origin: `https://d2i14zgn3xm1xu.cloudfront.net`
   - Access-Control-Allow-Headers: `Content-Type,x-api-key,api-key,Authorization`
   - Access-Control-Allow-Methods: `GET,POST,PUT,DELETE,OPTIONS,PATCH`
   - Access-Control-Allow-Credentials: `true`

### Option 2: Lambda Function CORS
If using Lambda functions, add CORS headers in your Lambda response:

```javascript
const response = {
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': 'https://d2i14zgn3xm1xu.cloudfront.net',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key, api-key, Authorization',
    'Access-Control-Allow-Credentials': 'true'
  },
  body: JSON.stringify(data)
};
```

### Option 3: CloudFront Proxy
Configure CloudFront to proxy API requests:

1. Create a new CloudFront distribution
2. Add behavior for `/api/*` that points to the API Gateway
3. Configure origin settings to forward all headers

## 🧪 **TESTING CORS**

You can test CORS configuration using curl:

```bash
curl -H "Origin: https://d2i14zgn3xm1xu.cloudfront.net" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: x-api-key,api-key,Authorization" \
     -X OPTIONS \
     https://eo6cj32bch.execute-api.us-east-2.amazonaws.com/prod/api/v1/admin/users
```

Expected response should include CORS headers.

## 📝 **NOTES**

- The frontend is currently using simulated data in development mode
- Production mode will use the real API once CORS is configured
- All API endpoints need CORS configuration, not just specific ones
- Consider adding multiple origins if needed (e.g., localhost for development)

## 🔄 **NEXT STEPS**

1. Configure CORS in API Gateway or Lambda functions
2. Test with the curl command above
3. Deploy the changes
4. Test the frontend in production mode 