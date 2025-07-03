# AWS Cognito Setup Guide

## Custom Attributes Configuration

This project uses custom attributes in AWS Cognito to store user plan information. Follow these steps to configure the required custom attributes.

### Option 1: Using AWS Console (Recommended)

1. **Go to AWS Console**
   - Navigate to **AWS Console** → **Cognito** → **User Pools**
   - Select your User Pool

2. **Configure Custom Attributes**
   - Go to **Sign-up experience** → **Custom attributes**
   - Click **Add custom attributes**
   - Create the following attribute:
     - **Name**: `plan`
     - **Type**: `String`
     - **Required**: `No` (optional)
     - **Mutable**: `Yes` (so it can be changed by admin)

3. **Save Changes**
   - Click **Save changes** to apply the configuration

### Option 2: Using AWS CLI Script

1. **Prerequisites**
   - AWS CLI installed and configured
   - Appropriate AWS credentials with Cognito permissions
   - Environment variables set:
     ```bash
     export AWS_USER_POOL_ID="your-user-pool-id"
     export AWS_REGION="us-east-2"  # or your region
     ```

2. **Run the Setup Script**
   ```bash
   node scripts/setup-cognito-attributes.js
   ```

3. **Verify Configuration**
   - The script will check if the attribute exists
   - If not, it will create it automatically
   - You'll see confirmation messages

### Option 3: Manual AWS CLI Commands

If you prefer to run the commands manually:

```bash
# Check existing attributes
aws cognito-idp describe-user-pool \
  --user-pool-id YOUR_USER_POOL_ID \
  --region YOUR_REGION

# Add custom plan attribute
aws cognito-idp update-user-pool \
  --user-pool-id YOUR_USER_POOL_ID \
  --region YOUR_REGION \
  --schema Name=custom:plan,AttributeDataType=String,Required=false,Mutable=true
```

## After Configuration

Once the custom attribute is configured:

1. **Uncomment the Code**
   - Go to `src/lib/aws/cognito.ts`
   - Uncomment the `custom:plan` attribute in the `signUp` method

2. **Test Registration**
   - Try registering a new user with plan selection
   - The plan should be saved to Cognito without errors

3. **Admin Interface**
   - Admins can now update user plans via the admin interface
   - The plan will be stored in the `custom:plan` attribute

## Troubleshooting

### "A client attempted to write unauthorized attribute" Error

This error occurs when trying to write to a custom attribute that doesn't exist in the User Pool.

**Solution:**
1. Follow the configuration steps above
2. Make sure the attribute name is exactly `custom:plan`
3. Wait a few minutes for changes to propagate

### Permission Errors

If you get permission errors when running the script:

**Required AWS Permissions:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:DescribeUserPool",
        "cognito-idp:UpdateUserPool"
      ],
      "Resource": "arn:aws:cognito-idp:*:*:userpool/*"
    }
  ]
}
```

### Attribute Already Exists

If you get an error saying the attribute already exists:

1. Check the AWS Console to see existing custom attributes
2. The attribute might have a different name or configuration
3. You can modify existing attributes through the console

## Current Status

- ✅ Custom attribute API route created (`/api/admin/users/[id]/plan`)
- ✅ Admin interface updated to handle plan updates
- ✅ Registration form includes plan selection
- ⏳ Custom attribute needs to be configured in Cognito User Pool
- ⏳ Plan attribute code is temporarily commented out

Once you configure the custom attribute, uncomment the code in `src/lib/aws/cognito.ts` and the system will work fully. 