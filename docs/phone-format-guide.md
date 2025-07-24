# Phone Number Format Guide

## AWS Cognito Phone Number Requirements

AWS Cognito requires phone numbers to be in **E.164 format**, which is an international standard for phone number formatting.

### E.164 Format Requirements

- **Must start with +** (plus sign)
- **Must include country code** (1-3 digits)
- **Must be between 7 and 15 digits total**
- **No spaces, dashes, parentheses, or other characters**
- **Only digits and + allowed**

### Examples of Valid Formats

#### Colombia (+57)
```
✅ +573178901234
✅ +573001234567
✅ +571234567890
```

#### Mexico (+52)
```
✅ +525512345678
✅ +528112345678
✅ +523312345678
```

#### United States (+1)
```
✅ +15551234567
✅ +12125551234
```

#### United Kingdom (+44)
```
✅ +442079460958
✅ +447911123456
```

### Examples of Invalid Formats

```
❌ 573178901234     (missing +)
❌ +57 317 890 1234 (contains spaces)
❌ +57-317-890-1234 (contains dashes)
❌ +57(317)890-1234 (contains parentheses)
❌ +57317890123     (too short)
❌ +573178901234567 (too long)
❌ +57317890123a    (contains letter)
```

## Implementation in the Application

### Frontend Validation

The application validates phone numbers in real-time:

1. **Colombia (+57)**: Must have exactly 10 digits after +57
2. **Mexico (+52)**: Must have exactly 10 digits after +52
3. **Other countries**: Must follow E.164 format

### Backend Formatting

Before sending to AWS Cognito, the application:

1. **Removes all non-digit characters** except +
2. **Ensures the number starts with +**
3. **Validates the final format**

### Code Example

```typescript
const formatPhoneForCognito = (phone: string): string => {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Ensure it starts with +
  if (!cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }
  
  return cleaned;
};
```

## Country-Specific Guidelines

### Colombia (+57)

**Mobile Numbers:**
- Format: +57 3XX XXX XXXX
- Examples: +573178901234, +573001234567

**Landline Numbers:**
- Format: +57 1XX XXX XXXX or +57 4XX XXX XXXX
- Examples: +571234567890, +574123456789

### Mexico (+52)

**Mobile Numbers:**
- Format: +52 1XX XXX XXXX
- Examples: +521551234567, +528112345678

**Landline Numbers:**
- Format: +52 XX XXXX XXXX
- Examples: +525512345678, +528112345678

### United States (+1)

**All Numbers:**
- Format: +1 XXX XXX XXXX
- Examples: +15551234567, +12125551234

## Testing Phone Numbers

Use the test script to verify phone number formats:

```bash
node scripts/test-phone-format.js
```

This script will:
- Test various phone number formats
- Show which ones are valid/invalid
- Display the formatted version for Cognito
- Provide helpful error messages

## Common Issues and Solutions

### Issue: "Invalid phone number format"

**Cause:** Phone number doesn't follow E.164 format

**Solution:**
1. Ensure the number starts with +
2. Include the correct country code
3. Remove all spaces, dashes, and other characters
4. Verify the total length is between 7-15 digits

### Issue: "Phone number too short/long"

**Cause:** Number doesn't meet length requirements

**Solution:**
- **Too short:** Add missing digits
- **Too long:** Remove extra digits
- Verify country code is correct

### Issue: "Invalid country code"

**Cause:** Country code doesn't exist or is incorrect

**Solution:**
- Use valid country codes (1-3 digits)
- Common codes: +1 (US/Canada), +44 (UK), +57 (Colombia), +52 (Mexico)

## Best Practices

1. **Always include country code** - Don't assume local format
2. **Use + prefix** - Required by E.164 standard
3. **Remove formatting** - No spaces, dashes, or parentheses
4. **Validate length** - Ensure 7-15 digits total
5. **Test thoroughly** - Use the test script before deployment

## Troubleshooting

If you're still having issues:

1. **Run the test script** to verify your number format
2. **Check AWS Cognito logs** for specific error messages
3. **Verify country code** is correct for your region
4. **Test with a known valid number** first
5. **Check for hidden characters** in the input

## Resources

- [E.164 Wikipedia](https://en.wikipedia.org/wiki/E.164)
- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html)
- [Country Calling Codes](https://en.wikipedia.org/wiki/List_of_country_calling_codes) 