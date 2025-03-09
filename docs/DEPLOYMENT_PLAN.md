# Avanti App Deployment Plan

## 1. Pre-deployment Preparation

### Required Assets
- [ ] App Icon (1024x1024px)
- [ ] Splash Screen (2048x2048px)
- [ ] App Store Screenshots (minimum 3)
  - Feed screen
  - Friends screen
  - Profile screen
  - All in 6.5" iPhone format
- [ ] App Preview Video (optional)

### App Store Information
- [ ] App Description
- [ ] Keywords
- [ ] Privacy Policy URL
- [ ] Support URL
- [ ] Marketing URL (optional)
- [ ] Age Rating Information

## 2. Technical Configuration

### Update app.json
```json
{
  "expo": {
    "name": "Avanti",
    "slug": "avanti",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "com.avanti.app",
      "buildNumber": "1",
      "supportsTablet": false,
      "infoPlist": {
        "NSCameraUsageDescription": "Avanti needs camera access to let you take profile pictures",
        "NSPhotoLibraryUsageDescription": "Avanti needs photo library access to let you choose profile pictures",
        "NSPhotoLibraryAddUsageDescription": "Avanti needs access to save photos",
        "NSLocationWhenInUseUsageDescription": "Avanti needs location access to show you nearby students"
      }
    }
  }
}
```

### Environment Variables
- [ ] Ensure all development environment variables are updated for production
- [ ] Verify Supabase configuration
- [ ] Check API endpoints

## 3. Development Testing

### Setup Development Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Create development build
eas build --profile development --platform ios
```

### Test Critical Features
- [ ] Authentication flow
- [ ] Profile creation and editing
- [ ] Image upload and management
- [ ] Friend requests
- [ ] Messaging integration
- [ ] Deep linking
- [ ] Push notifications
- [ ] Offline behavior
- [ ] Background/foreground transitions

## 4. Production Deployment

### Apple Developer Account Setup
1. Enroll in Apple Developer Program ($99/year)
2. Create necessary certificates and identifiers
3. Set up App Store Connect account

### Build Production Version
```bash
# Create production build
eas build --profile production --platform ios

# Submit to App Store
eas submit --platform ios
```

### App Store Connect Setup
1. Create new app in App Store Connect
2. Fill in required information:
   - App name: Avanti
   - Bundle ID: com.avanti.app
   - SKU: avanti-1
   - Primary language: German
3. Complete all sections:
   - App Information
   - Pricing and Availability
   - App Privacy
   - App Store Information

## 5. Final Checklist

### Code Quality
- [ ] Remove all console.logs
- [ ] Error handling implemented
- [ ] Loading states for async operations
- [ ] No hardcoded development URLs
- [ ] Image optimization
- [ ] Bundle size optimization

### User Experience
- [ ] All flows tested
- [ ] Error messages are user-friendly
- [ ] Loading indicators in place
- [ ] Offline functionality tested
- [ ] Different screen sizes tested

### Legal & Privacy
- [ ] Privacy Policy in place
- [ ] Terms of Service completed
- [ ] Data handling compliance
- [ ] Age restrictions set
- [ ] Required permissions justified

### Support
- [ ] Support contact setup
- [ ] FAQ prepared
- [ ] User documentation ready
- [ ] Bug reporting system in place

## 6. Post-Launch Plan

### Monitoring
- [ ] Analytics implementation
- [ ] Crash reporting setup
- [ ] User feedback collection
- [ ] Performance monitoring

### Updates
- [ ] Version update mechanism
- [ ] Hotfix process
- [ ] Feature update pipeline
- [ ] User communication plan

## 7. Important Links

- Apple Developer Account: https://developer.apple.com
- App Store Connect: https://appstoreconnect.apple.com
- Expo Documentation: https://docs.expo.dev
- Supabase Dashboard: https://app.supabase.com

## 8. Contact Information

- Technical Support: [Add email]
- App Store Team: [Add contact]
- Emergency Contact: [Add contact]
