# Email Confirmation Troubleshooting Guide

## Problem: No confirmation email received after registration

This guide helps you diagnose and fix issues with AWS Cognito email delivery.

## Quick Diagnosis

### 1. Check Email Configuration
Run the diagnostic script:
```bash
export AWS_USER_POOL_ID="your-user-pool-id"
export AWS_REGION="us-east-2"
node scripts/check-cognito-email-config.js
```

### 2. Common Issues and Solutions

#### Issue 1: Email Configuration Not Set Up
**Symptoms:**
- No email configuration found in diagnostic script
- Users never receive confirmation emails

**Solution:**
1. Go to **AWS Console** → **Cognito** → **User Pools** → **Your Pool**
2. Navigate to **Messaging** → **Email configuration**
3. Configure:
   - **Email source**: Choose `COGNITO_DEFAULT` (recommended) or `DEVELOPER`
   - **From email address**: Leave empty for COGNITO_DEFAULT
   - **Reply-to email address**: Your support email

#### Issue 2: Email Verification Not Enabled
**Symptoms:**
- Users can register but emails are not sent
- No verification required in sign-up flow

**Solution:**
1. Go to **AWS Console** → **Cognito** → **User Pools** → **Your Pool**
2. Navigate to **Sign-up experience** → **Cognito-assisted verification and confirmation**
3. Enable **Cognito-assisted verification and confirmation**
4. Check **Email** as verification method
5. Save changes

#### Issue 3: Email in Spam Folder
**Symptoms:**
- Emails are sent but not received in inbox
- No error messages in AWS

**Solution:**
1. Check spam/junk folder
2. Add `no-reply@verificationemail.com` to safe senders list
3. Check email client settings

#### Issue 4: SES Sending Limits
**Symptoms:**
- Emails work in development but fail in production
- AWS SES sending limits exceeded

**Solution:**
1. Go to **AWS SES Console**
2. Check sending limits and quotas
3. Request production access if in sandbox mode
4. Monitor sending statistics

#### Issue 5: Email Template Issues
**Symptoms:**
- Emails sent but with wrong content
- Missing verification codes

**Solution:**
1. Go to **AWS Console** → **Cognito** → **User Pools** → **Your Pool**
2. Navigate to **Messaging** → **Verification message template**
3. Configure:
   - **Email subject**: Custom subject line
   - **Email message**: Include `{####}` placeholder for verification code
   - **Email message by link**: Include `{##Verify Email##}` placeholder

## Manual Testing

### 1. Test Email Configuration
```bash
# Check if emails are being sent
aws cognito-idp describe-user-pool \
  --user-pool-id YOUR_USER_POOL_ID \
  --region YOUR_REGION \
  --query 'UserPool.EmailConfiguration'
```

### 2. Test User Registration
```bash
# Create a test user
aws cognito-idp admin-create-user \
  --user-pool-id YOUR_USER_POOL_ID \
  --username test@example.com \
  --user-attributes Name=email,Value=test@example.com \
  --temporary-password TempPass123! \
  --message-action SUPPRESS
```

### 3. Check CloudWatch Logs
1. Go to **AWS CloudWatch** → **Log groups**
2. Look for Cognito-related logs
3. Search for email delivery errors

## Alternative Solutions

### 1. Use Custom Email Provider
If Cognito email is unreliable, consider using a custom email service:

1. **Configure SES with custom domain**
2. **Use Mailgun or SendGrid**
3. **Implement custom email sending in your API**

### 2. Manual User Confirmation
For testing purposes, you can manually confirm users:

```bash
# Confirm a user manually
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id YOUR_USER_POOL_ID \
  --username user@example.com
```

### 3. Disable Email Verification (Development Only)
⚠️ **Warning: Only for development/testing**

1. Go to **AWS Console** → **Cognito** → **User Pools** → **Your Pool**
2. Navigate to **Sign-up experience**
3. Disable **Cognito-assisted verification and confirmation**
4. Users will be automatically confirmed

## Best Practices

### 1. Email Configuration
- Use `COGNITO_DEFAULT` for production
- Configure custom templates for better UX
- Set up proper reply-to addresses

### 2. Monitoring
- Set up CloudWatch alarms for email failures
- Monitor SES sending statistics
- Track email delivery rates

### 3. User Experience
- Provide clear instructions about email verification
- Include "Resend code" functionality
- Show helpful error messages

### 4. Testing
- Test with multiple email providers
- Verify spam folder behavior
- Test email templates thoroughly

## Current Implementation

The application includes:

- ✅ **Resend confirmation code** functionality
- ✅ **Error handling** for email issues
- ✅ **User-friendly messages** about email verification
- ✅ **Diagnostic scripts** for troubleshooting
- ✅ **API endpoints** for manual confirmation

## Next Steps

1. **Run the diagnostic script** to identify the issue
2. **Configure email settings** in AWS Console
3. **Test with a real email address**
4. **Monitor CloudWatch logs** for any errors
5. **Use the resend functionality** if emails are delayed

If you continue having issues, check the AWS documentation for Cognito email configuration or consider using a custom email service. 