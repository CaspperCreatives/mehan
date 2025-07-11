# Assets Folder

This folder contains publicly accessible assets for the LinkedIn Profile Scorer extension.

## Structure

```
assets/
├── icons/           # Extension icons and UI icons
│   ├── icon16.png   # 16x16 extension icon
│   ├── icon32.png   # 32x32 extension icon
│   ├── icon48.png   # 48x48 extension icon
│   ├── icon128.png  # 128x128 extension icon
│   ├── icon16.svg   # SVG version of 16x16 icon
│   ├── icon32.svg   # SVG version of 32x32 icon
│   ├── icon48.svg   # SVG version of 48x48 icon
│   ├── icon128.svg  # SVG version of 128x128 icon
│   ├── bgPic.svg    # Background picture icon
│   ├── country.svg  # Country icon
│   ├── education.svg # Education icon
│   ├── experiences.svg # Experiences icon
│   ├── headline.svg # Headline icon
│   ├── linkedInUrl.svg # LinkedIn URL icon
│   ├── profilePic.svg # Profile picture icon
│   ├── projects.svg # Projects icon
│   ├── recommendations.svg # Recommendations icon
│   ├── skills.svg   # Skills icon
│   └── summary.svg  # Summary icon
└── README.md        # This file
```

## Public Access

All assets in this folder are publicly accessible through the extension. The webpack configuration copies this entire folder to the `dist` directory during build, making it available at runtime.

### Accessing Icons

Icons can be accessed using the following path pattern:
- Extension icons: `/assets/icons/icon{size}.png` or `/assets/icons/icon{size}.svg`
- UI icons: `/assets/icons/{iconName}.svg`

### Web Accessible Resources

The manifest.json includes this folder in `web_accessible_resources`, allowing the extension to access these assets from content scripts and popup pages.

## Adding New Assets

To add new assets:
1. Place them in the appropriate subfolder within `assets/`
2. Update the webpack.config.js if needed to copy additional asset types
3. Reference them using the `/assets/` path prefix 