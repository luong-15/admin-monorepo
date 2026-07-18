# 401 Unauthorized Error - Authentication Fixes

## Problem Summary

The backend was returning `401 Unauthorized` errors when calling `/api/admin/products` API endpoints because of several authentication and authorization issues in the JWT verification filter.

## Root Causes Fixed

### 1. **Missing Return Statements in SupabaseJwtAuthFilter**

**Issue**: After sending error responses with `response.sendError()`, the filter did not return, causing the request to continue processing.

**Fix**:

- Added explicit `return` statements after each error response
- Changed from `response.sendError()` to `response.setStatus()` + `response.getWriter().write()` with JSON responses
- This ensures errors are properly communicated and processing stops immediately

### 2. **Security Context Cleared After Authentication**

**Issue**: The `finally` block was clearing the security context even after successful authentication, which could cause authorization failures downstream.

**Fix**:

- Removed the problematic `finally` block that unconditionally cleared the security context
- Spring Security will now properly manage the context lifecycle
- Context persists through the entire request-response cycle

### 3. **Role Extraction Improvements**

**Issue**: The JWT role extraction only looked in `app_metadata.role`, which could be missing or stored elsewhere in the token.

**Fix**: Updated `SupabaseJwtVerifier.java` to try multiple locations for the role:

- `app_metadata.role` (primary Supabase location)
- Root level `role` claim (fallback)
- `user_role` claim (another fallback)
- Database lookup via `UserRepository` as secondary check

## Files Modified

### 1. `SupabaseJwtAuthFilter.java`

```
Changes:
- Removed finally block
- Added return statements after errors
- Improved error response format (JSON)
- Fixed error handling flow
```

### 2. `SupabaseJwtVerifier.java`

```
Changes:
- Enhanced role extraction with multiple fallback locations
- Better handling of null values
- Support for different JWT structures
```

## How to Set Up Admin Users in Supabase

### Option 1: Via SQL (Direct Database)

```sql
-- Update an existing user to have admin role
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'
)
WHERE email = 'your-email@example.com';
```

### Option 2: Via Supabase Admin API (Recommended)

Use Supabase Admin CLI or API:

```javascript
// Using Supabase Admin SDK
const { data, error } = await supabase.auth.admin.updateUserById(userId, {
  app_metadata: { role: "admin" },
});
```

### Option 3: Verify Current Setup

Check if a user has admin role:

```sql
SELECT id, email, raw_app_meta_data ->> 'role' as role
FROM auth.users
WHERE email = 'your-email@example.com';
```

## Verification Steps

### 1. Test Authentication

```bash
# Get your Supabase session token
curl -X POST "https://jbpaivqemmarharbjbyv.supabase.co/auth/v1/token" \
  -H "Content-Type: application/json" \
  -d '{"grant_type":"password", "email":"your-email@example.com", "password":"your-password"}'
```

### 2. Test API Call

```bash
# Replace TOKEN with your access_token from step 1
curl -X GET "http://localhost:8080/api/admin/products" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"
```

### 3. Check Backend Logs

- Look for JWT verification errors
- Verify role extraction from token
- Check database role lookup if JWT role is missing

## Common Issues & Solutions

### Issue: Still Getting 401

**Solutions**:

1. Verify the user has `admin` role in Supabase `raw_app_meta_data`
2. Check token is not expired
3. Ensure Authorization header format is correct: `Authorization: Bearer <token>`
4. Verify frontend is using `fetchWithAuth()` helper which includes the token

### Issue: Token Verification Error

**Solutions**:

1. Check Supabase JWKS URL is accessible
2. Verify JWT secret in `application.yml` matches Supabase
3. Check issuer URL matches in configuration
4. Ensure token signature is valid

### Issue: Role Check Fails

**Solutions**:

1. Confirm user has `admin` role in `app_metadata`
2. Check `UserRepository.findRoleByUserId()` can access auth.users table
3. Verify database connection credentials

## Configuration Reference

See `src/main/resources/application.yml`:

```yaml
supabase:
  jwks-url: ${SUPABASE_JWKS_URL:...}
  jwt-issuer: ${SUPABASE_JWT_ISSUER:...}
  jwt-secret: ${SUPABASE_JWT_SECRET:...}
```

Ensure these environment variables are set correctly in your deployment environment.

## Testing Checklist

- [ ] Backend compiles without errors
- [ ] Admin user has "admin" role in Supabase
- [ ] Token is not expired
- [ ] Authorization header is correctly formatted
- [ ] Frontend uses `fetchWithAuth()` helper
- [ ] CORS is properly configured
- [ ] Database connection works
- [ ] API endpoint returns products with valid auth

## Next Steps

1. Set admin role for your user in Supabase
2. Rebuild and restart the backend
3. Test API calls from frontend
4. Monitor logs for any authentication issues
5. Consider adding more granular role-based access control (RBAC) if needed

---

**Note**: The frontend already uses the `fetchWithAuth()` helper in `lib/utils.ts` which automatically includes the Supabase access token in the Authorization header.
