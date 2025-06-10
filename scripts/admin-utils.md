# GitSpicefy Admin Utils

## How to Manually Grant Premium Access or Usage Credits

### 1. Access Supabase Dashboard
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your GitSpicefy project: `https://supabase.com/dashboard/project/suutpiqnxfxdbkgbmeoy`
3. Navigate to **Table Editor** → **subscriptions**

### 2. Find User by GitHub Username
First, you need to find the user's ID:
1. Go to **Authentication** → **Users**
2. Find the user by their email or GitHub username
3. Copy their **User ID** (UUID format)

### 3. Update Subscription Directly in Database

#### Option A: Using Table Editor (GUI)
1. In **Table Editor** → **subscriptions**
2. Find the row with the user's `user_id`
3. Click **Edit** and modify:
   - `plan`: Change to `'starter'`, `'monthly'`, or `'lifetime'`
   - `generations_used`: Reset to `0` if needed
   - `generations_limit`: Set to desired limit (10, 50, etc.)
   - `has_advanced_features`: Set to `true` for premium plans
   - `expires_at`: Set expiration date for monthly plans (or NULL for lifetime)

#### Option B: Using SQL Editor
```sql
-- Grant Lifetime Premium to a user
UPDATE subscriptions 
SET 
  plan = 'lifetime',
  generations_used = 0,
  generations_limit = 50,
  has_advanced_features = true,
  expires_at = NULL,
  updated_at = NOW()
WHERE user_id = 'USER_ID_HERE';

-- Grant Monthly Premium (30 days from now)
UPDATE subscriptions 
SET 
  plan = 'monthly',
  generations_used = 0,
  generations_limit = 50,
  has_advanced_features = true,
  expires_at = NOW() + INTERVAL '30 days',
  updated_at = NOW()
WHERE user_id = 'USER_ID_HERE';

-- Grant Starter Pack
UPDATE subscriptions 
SET 
  plan = 'starter',
  generations_used = 0,
  generations_limit = 10,
  has_advanced_features = true,
  expires_at = NULL,
  updated_at = NOW()
WHERE user_id = 'USER_ID_HERE';

-- Just add more usage credits (keep current plan)
UPDATE subscriptions 
SET 
  generations_used = 0,
  updated_at = NOW()
WHERE user_id = 'USER_ID_HERE';

-- Find user by email (if you know their email)
SELECT u.id, u.email, s.* 
FROM auth.users u 
LEFT JOIN subscriptions s ON u.id = s.user_id 
WHERE u.email = 'user@example.com';
```

### 4. Plan Types and Limits

| Plan | Generations Limit | Advanced Features | Expires |
|------|------------------|-------------------|---------|
| `free` | 1 | false | Never |
| `starter` | 10 | true | Never |
| `monthly` | 50 | true | 30 days |
| `lifetime` | 50 | true | Never |

### 5. Quick Testing Commands

```sql
-- See all subscriptions
SELECT 
  u.email,
  s.plan,
  s.generations_used,
  s.generations_limit,
  s.has_advanced_features,
  s.expires_at,
  s.updated_at
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
ORDER BY s.updated_at DESC;

-- Reset all users to free plan (for testing)
UPDATE subscriptions 
SET 
  plan = 'free',
  generations_used = 0,
  generations_limit = 1,
  has_advanced_features = false,
  expires_at = NULL;
```

### 6. User Will See Changes Immediately
- Changes take effect immediately when user refreshes the page
- No need to clear browser cache since data is now stored in database
- User can access their subscription from any device/browser

### 7. Monitoring Usage
```sql
-- See users who are close to their limits
SELECT 
  u.email,
  s.plan,
  s.generations_used,
  s.generations_limit,
  (s.generations_limit - s.generations_used) as remaining
FROM subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE s.generations_used >= s.generations_limit * 0.8
ORDER BY remaining ASC;
```
