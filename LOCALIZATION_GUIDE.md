# 🌍 Localization Guide

## Overview
This app supports multiple languages using a custom lightweight localization system.

## How It Works

### 1. **Translation Files**
Located in `/src/locales/`:
- `en.json` - English translations
- `sk.json` - Slovak translations

### 2. **Language Context**
`/src/contexts/LanguageContext.jsx` provides:
- `language` - current language code
- `changeLanguage(lang)` - function to change language
- `t(key)` - function to get translations

### 3. **Using Translations in Components**

```javascript
import { useLanguage } from '../contexts/LanguageContext';

function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('navigation.dashboard')}</h1>
      <p>{t('dashboard.welcome')}</p>
    </div>
  );
}
```

### 4. **Translation Key Format**
Keys use dot notation: `section.subsection.key`

Examples:
- `t('navigation.dashboard')` → "Dashboard" / "Prehľad"
- `t('liveMatches.title')` → "Live Matches" / "Live Zápasy"
- `t('common.save')` → "Save" / "Uložiť"

## Adding New Translations

### Step 1: Add to Translation Files
Add the same key to both `en.json` and `sk.json`:

**en.json:**
```json
{
  "mySection": {
    "myKey": "My English Text"
  }
}
```

**sk.json:**
```json
{
  "mySection": {
    "myKey": "Môj Slovenský Text"
  }
}
```

### Step 2: Use in Component
```javascript
const { t } = useLanguage();
<div>{t('mySection.myKey')}</div>
```

## Language Switcher
The language switcher is in the navigation sidebar and allows users to:
- Switch between English (🇬🇧) and Slovak (🇸🇰)
- Preference is saved to localStorage
- Persists across sessions

## Example: Converting a Component

### Before:
```javascript
function MyComponent() {
  return (
    <div>
      <h1>Dashboard</h1>
      <button>Create Tournament</button>
      <p>No tournaments yet</p>
    </div>
  );
}
```

### After:
```javascript
import { useLanguage } from '../contexts/LanguageContext';

function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button>{t('tournaments.create')}</button>
      <p>{t('dashboard.noTournaments')}</p>
    </div>
  );
}
```

## Available Translation Sections

- `navigation` - Navigation menu items
- `dashboard` - Dashboard page
- `tournaments` - Tournaments list and management
- `liveMatches` - Live matches dashboard
- `match` - Match interface
- `tournamentCreation` - Tournament creation form
- `tournamentManagement` - Tournament management page
- `tournamentRegistration` - Player registration
- `auth` - Login/signup forms
- `common` - Common buttons and messages

## Adding a New Language

### Step 1: Create Translation File
Create `/src/locales/de.json` (for German, for example)

### Step 2: Update Language Context
In `/src/contexts/LanguageContext.jsx`:
```javascript
import de from '../locales/de.json';

const translations = {
  en,
  sk,
  de  // Add new language
};
```

### Step 3: Update Language Switcher
In `/src/components/LanguageSwitcher.jsx`:
```javascript
const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' }  // Add new language
];
```

## Best Practices

1. **Use Descriptive Keys**: `tournaments.noTournaments` is better than `msg1`
2. **Group Related Translations**: Keep related translations in the same section
3. **Keep Keys Consistent**: Use the same key structure across all language files
4. **Test Both Languages**: Always test your changes in both English and Slovak
5. **Fallback to English**: If a translation is missing, the system falls back to English

## Tips

- Use `t()` for all user-facing text
- Don't translate:
  - Variable names
  - Console logs
  - Technical error messages (for debugging)
  - Database field names
- Do translate:
  - UI labels
  - Button text
  - Error messages shown to users
  - Help text and descriptions

## Current Status

✅ **Implemented:**
- Language context and provider
- Language switcher in navigation
- Translation files for English and Slovak
- Example implementation in LiveMatchesDashboard

⏳ **To Do:**
- Convert remaining components to use translations
- Add more translations as needed
- Test all translations in both languages
