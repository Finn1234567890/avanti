# Pflichtenheft

# TODO

## High Priority
1. Fix Page Data Loading
   - Implement proper loading states DONE
   - Avoid unnecessary reloads DONE
   - Add pull-to-refresh where appropriate DONE
   - Optimize data fetching strategies

2. Fix Profile Page Editing
   - Improve real-time updates
   - Add proper validation
   - Fix image reordering functionality 
   - Optimize debounced saves
   - Add loading indicators during saves

3. Fix Navigation Bar
   - Improve styling and layout DONE
   - Add active state indicators DONE
   - Fix navigation transitions DONE
   - Add badges for notifications/pending requests
   - Ensure consistent behavior across app
   - Rearrange navigation items for better UX DONE
   - Fix components appearing as navigation items DONE

4. Phone Number Implementation
   - Add phone number field to registration DONE
   - Implement phone number validation 
   - Set up SMS verification system 
   - Handle international phone numbers DONE

5. Phone Verification Flow
   - Implement SMS code sending
   - Add verification code input UI
   - Handle verification timeouts
   - Add resend code functionality
   - Implement security measures

6. Styling Improvements
   - Create consistent design system DONE
   - Implement dark mode support 
   - Add proper animations and transitions DONE
   - Improve accessibility DONE
   - Make UI more responsive DONE
   - Add loading skeletons 
   - Polish visual feedback DONE

7. Algortihm
   - Implement similarity sorting algorithm DONE
   - Implement penalty functionality


## Future Improvements
- Add proper error boundaries
- Implement caching strategy
- Add offline support
- Optimize image loading and caching
- Add proper TypeScript types for all components 

## Architecture & Tech Stack
- Frontend: Expo with TypeScript using Expo Router
- Backend: Node.js using TypeScript
- Database: Supabase

## User Flow

### Onboarding

#### Start Screen
- For non-logged in users:
  - Display Start/Onboarding screen with:
    - Create Account option
    - Log In option
    - Terms of Service and Privacy Policy links
- For logged in users:
  - Redirect to Home Page

#### Account Creation
1. **Create Account**
   - Supabase Authentication
   - Required fields:
     - Email (with verification)
     - Phone Number
2. **Terms Agreement**
   - Accept Terms and Conditions
   - Progress to Onboarding

#### Onboarding Process
Sequential screens with Next button:
1. Name Entry
2. Major Selection
3. Interest Tags Selection
4. Profile Description
5. Image Upload (minimum 2)
   - Gallery integration
   - Add button functionality
6. Account Finalization
   - Save to Supabase

### Home Page

#### Navigation
Bottom bar with three sections:
1. Home (Discover)
2. Friends
3. Profile

#### Profile Discovery
- Profile display:
  - Top: Profile Images (swipeable)
  - Bottom: User Details
    - Name
    - Description
    - Major
    - Tags
- Vertical swipe navigation

#### Friend Requests
- Send request button
- Updates Friendship Table

### Friend Page
Displays:
- Accepted Friends
- Outgoing Requests
- Incoming Requests

### Profile Page
- User Information Display
- Account Management
  - Delete Account option

## Database Schema
Primary keys in **bold**, Foreign keys in *italics*

### Tables
- **User**
  - **User-ID**
  - Email
  - Phone
  - Name

- **Profile**
  - **P-ID**
  - *User-ID*
  - major
  - tags
  - description
  - age

- **Images**
  - **Image-ID**
  - *P-ID*
  - url

- **Friendship**
  - **Friendship-ID**
  - *requester-ID*
  - *receiver-ID*
  - status
  - created_at

## Functional Requirements

### Core Features
- [x] Authentication (signup, login, logout)
- [x] Account Management
- [x] Profile Management
- [x] Image Handling
- [x] Friend System
- [x] Phone Number Exchange
- [x] Onboarding Flow
- [x] Navigation
- [x] Loading States
- [x] Profile Discovery
- [x] Account Recovery
- [x] Verification System
- [x] Legal Compliance

## Row Level Security

### Users Table
| Action | Policy | Purpose |
|--------|---------|----------|
| SELECT | Authenticated only | Data protection |
| UPDATE | Own profile only | Unauthorized changes prevention |
| DELETE | Own profile only | Account security |

### Profile Table
| Action | Policy | Purpose |
|--------|---------|----------|
| SELECT | Public access | Profile discovery |
| UPDATE | Own profile only | Data integrity |
| INSERT | Authenticated only | Profile ownership |

### Images Table
| Action | Policy | Purpose |
|--------|---------|----------|
| SELECT | Public access | Profile viewing |
| UPDATE | Own images only | Image management |
| INSERT | Public access | Profile setup |
| DELETE | Own images only | Image management |

### Friendship Table
| Action | Policy | Purpose |
|--------|---------|----------|
| SELECT | Involved users only | Privacy |
| UPDATE | Own connections only | Connection management |
| INSERT | Receiver only | Request handling |
| DELETE | Involved users only | Connection removal |

## Development Plan
1. Planning & Requirements
2. Design & Architecture
3. Implementation
4. Testing & QA
5. Release

## Code Conventions
- Strict TypeScript usage
- Component-based architecture
- Expo Router standards
- Feature-based organization
- JSDoc documentation

# Lastenheft

## Project Vision
Avanti facilitates connections between Uni Hamburg students with shared interests, enabling study partnerships and social connections.

## Problem Statement
Addresses the challenge of making meaningful connections beyond orientation week, providing an ongoing platform for student networking.

## Technical Architecture
- Frontend: Expo with TypeScript
- Backend: Node.js
- Database: Supabase

## Core Features
| Feature | Description | Implementation |
|---------|-------------|----------------|
| Authentication | Account creation and management | Supabase Auth |
| Profile Setup | User information and preferences | Frontend/Supabase |
| Connection System | Friend requests and matching | Backend security |
| Account Management | Data deletion and privacy | Backend integration |

## Target Audience
- Uni Hamburg students (18-28)
- Focus on academic and social connections
- Not intended for dating

## Non-Functional Requirements
- Intuitive UI/UX
- Data security
- Scalable architecture

## Project Structure

### Directory Layout
```
app/                         # Expo Router pages
├── (auth)/                 # Protected routes
│   ├── home/               # Home/discovery screen
│   ├── friends/            # Friends management
│   └── profile/            # Profile screens
├── (public)/               # Public routes
│   ├── login/             # Login screen
│   ├── register/          # Registration
│   └── onboarding/        # Onboarding flow
└── _layout.tsx            # Root layout

components/                 # Reusable components
├── auth/                  # Auth related components
├── profile/               # Profile related components
├── friends/               # Friend system components
├── ui/                    # Generic UI components
└── shared/                # Shared components

lib/                       # Core functionality
├── supabase/             # Supabase client & utils
├── hooks/                # Custom hooks
├── utils/                # Utility functions
└── types/                # TypeScript types

constants/                 # App constants
├── theme.ts              # Theme configuration
└── config.ts             # App configuration

services/                 # API services
├── auth.ts              # Authentication service
├── profile.ts           # Profile management
└── friends.ts           # Friend system

assets/                   # Static assets
├── images/              # Image assets
└── icons/               # Icon assets
```

### Directory Descriptions

#### `app/`
- Main routing directory using Expo Router
- Protected routes under `(auth)`
- Public routes under `(public)`
- Each route can have its own layout and loading states

#### `components/`
- Reusable UI components organized by feature
- `auth/`: Authentication-related components
- `profile/`: Profile-related components
- `friends/`: Friend system components
- `ui/`: Generic UI components (buttons, inputs, etc.)
- `shared/`: Components used across multiple features

#### `lib/`
- Core application functionality
- `supabase/`: Database client and utilities
- `hooks/`: Custom React hooks
- `utils/`: Helper functions and utilities
- `types/`: TypeScript type definitions

#### `constants/`
- Application-wide constants
- Theme configuration
- Environment variables and config

#### `services/`
- API and data service implementations
- Separated by domain (auth, profile, friends)
- Handles all external communication

#### `assets/`
- Static assets used in the application
- Images and icons
- Other media resources

# Authentication
- Users can sign up with phone number and email
- Users can log in with phone number and password
- Phone verification required (will be implemented using Twilio)
- Email verification not required
- Users must complete onboarding after registration

# Authentication Flow

## Registration
1. User signs up with:
   - Email (for account management)
   - Password
   - Name (for profile)

2. After signup:
   - Create Profile entry
   - Collect phone number as profile data
   - Store phone in Profile table with privacy controls

## Login
- Simple email + password authentication
- No SMS verification needed for login

## Phone Number Handling
- Phone numbers stored in Profile table
- Row Level Security ensures:
  - Users can see their own phone number
  - Users can only see phone numbers of accepted friends
  - Phone numbers hidden from non-friends

## Benefits
1. Simpler authentication flow
2. Easier testing and development
3. Lower costs (no SMS for auth)
4. Better privacy control
5. Still maintains phone number sharing functionality

## Theme

The app uses a consistent color palette defined in `lib/theme/colors.ts`:

- Primary: White (#FFFFFF)
- Primary Accent: Mint Green (#89DFC2) 
- Secondary Accent: Hot Pink (#FF69B4)

These colors are used throughout the app to maintain visual consistency. Import them from the theme file rather than hardcoding color values.
