# Bhoomi - Data Storage System

## Overview
Bhoomi now uses **browser localStorage** for data persistence instead of Firebase. All user data, farm information, and sensor readings are stored locally in the user's browser.

## Storage Structure

### User Authentication
- **Key**: `bhoomi_users`
- **Format**: Array of user objects
```json
[
  {
    "firstName": "Rahul",
    "surname": "Patil",
    "email": "rahul@example.com",
    "password": "encrypted_password",
    "createdAt": "2025-01-10T10:00:00.000Z"
  }
]
```

### Current Session
- **Key**: `bhoomi_current_user`
- **Format**: Current logged-in user
```json
{
  "email": "rahul@example.com",
  "name": "Rahul Patil"
}
```

### Farm Data
- **Key**: `bhoomi_farms`
- **Format**: Farms organized by user email
```json
{
  "rahul@example.com": [
    {
      "id": "farm-1",
      "name": "Farm 1",
      "location": "Pune, Maharashtra",
      "area": 5.5
    }
  ]
}
```

### Sensor Readings
- **Key**: `bhoomi_farm_data`
- **Format**: Sensor data organized by user and farm
```json
{
  "rahul@example.com": {
    "farm-1": {
      "soilData": { "nitrogen": 40, "phosphorus": 35, ... },
      "weatherData": { "temperature": 32, ... },
      "zones": [...],
      "recommendations": [...]
    }
  }
}
```

## Features

### ✅ Sign Up
- First Name (required)
- Surname (required)
- Email (required, validated)
- Password (min 6 characters)
- Confirm Password (must match)
- Stores encrypted data in localStorage

### ✅ Login
- Email and password authentication
- Session persistence
- Remember me functionality
- Secure password handling

### ✅ Data Management
- Multi-farm support per user
- Real-time sensor data storage
- Weather data caching
- Irrigation history
- Crop recommendations

### ✅ Security Features
- Password validation (min 6 characters)
- Email format validation
- Duplicate email prevention
- Session management
- Auto-logout on browser close (optional)

## Storage Service API

### User Management
```typescript
import { getCurrentUser, saveCurrentUser, clearCurrentUser } from './services/storageService';

// Get current user
const user = getCurrentUser();

// Save user session
saveCurrentUser({ email: 'user@example.com', name: 'User Name' });

// Logout
clearCurrentUser();
```

### Farm Management
```typescript
import { getUserFarms, saveUserFarms, addUserFarm } from './services/storageService';

// Get all farms for user
const farms = getUserFarms('user@example.com');

// Add new farm
addUserFarm('user@example.com', newFarm);

// Save all farms
saveUserFarms('user@example.com', farms);
```

### Farm Data
```typescript
import { getFarmData, saveFarmData, getAllUserFarmData } from './services/storageService';

// Get specific farm data
const farmData = getFarmData('user@example.com', 'farm-1');

// Save farm data
saveFarmData('user@example.com', 'farm-1', data);

// Get all farm data for user
const allData = getAllUserFarmData('user@example.com');
```

## Advantages of localStorage

### ✅ Pros
1. **No Setup Required** - Works immediately without API keys
2. **Zero Cost** - No monthly fees or limits
3. **Fast Access** - Data loads instantly from local storage
4. **Offline Support** - Works without internet connection
5. **Privacy** - Data stays on user's device
6. **Simple** - No database setup or management

### ⚠️ Limitations
1. **Storage Limit** - ~5-10MB per domain
2. **Single Device** - Data doesn't sync across devices
3. **Browser Specific** - Data tied to specific browser
4. **Manual Backup** - Users must export data manually
5. **Clear on Cache Clear** - Data lost if browser cache cleared

## Data Backup & Export

```typescript
import { exportUserData, importUserData } from './services/storageService';

// Export user data as JSON
const backup = exportUserData('user@example.com');
// Download or save this backup string

// Import data from backup
const success = importUserData('user@example.com', backupString);
```

## Storage Monitoring

```typescript
import { getStorageInfo } from './services/storageService';

const info = getStorageInfo();
console.log(`Used: ${info.used} bytes`);
console.log(`Available: ${info.available} bytes`);
console.log(`Percentage: ${info.percentage}%`);
```

## Migration to Cloud (Future)

If you need to migrate to cloud storage later, you can:

1. **Firebase**: Re-enable Firebase and migrate localStorage data
2. **Supabase**: Set up Supabase and sync data
3. **Custom Backend**: Build REST API and migrate data
4. **MongoDB**: Use MongoDB Atlas for cloud storage

The current localStorage structure is designed to be easily migrated to any cloud database.

## Best Practices

1. **Regular Backups**: Export data periodically
2. **Storage Monitoring**: Check storage usage regularly
3. **Data Validation**: Always validate data before saving
4. **Error Handling**: Handle localStorage quota errors
5. **User Education**: Inform users about data persistence

## Troubleshooting

### Data Not Persisting?
- Check if localStorage is enabled in browser
- Verify browser isn't in incognito/private mode
- Check storage quota hasn't been exceeded

### Lost Data?
- Check if browser cache was cleared
- Look for exported backup files
- Verify user is using same browser/device

### Performance Issues?
- Monitor storage usage with `getStorageInfo()`
- Clean up old/unused farm data
- Consider archiving historical data

## Support

For issues or questions:
- Email: support@bhoomi.com
- Documentation: See inline code comments
- Storage Service: `/src/app/services/storageService.ts`
