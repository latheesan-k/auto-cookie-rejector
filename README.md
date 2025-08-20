# Auto Cookie Rejector

A Chrome extension that automatically rejects cookie consent banners on websites, helping you browse the web without interruptions.

## Features

- Automatically detects and dismisses cookie consent popups
- Works on most websites with cookie banners including YouTube
- Prevents page lockups and maintains responsiveness
- Lightweight and efficient
- No data collection or tracking
- Uses EasyList Cookie rules for better compatibility

## Installation

### Method 1: Install from Chrome Web Store (Coming Soon)

The extension will be available on the Chrome Web Store soon. Check back later for the link.

### Method 2: Manual Installation

1. **Download or Clone the Extension Files**
   - Download the ZIP file of this repository and extract it, or
   - Clone the repository using Git:
     ```
     git clone https://github.com/latheesan-k/auto-cookie-rejector.git
     ```

2. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Navigate to `chrome://extensions` in the address bar

3. **Enable Developer Mode**
   - Toggle on the "Developer mode" switch in the top right corner

4. **Load the Extension**
   - Click on the "Load unpacked" button
   - Select the folder containing the extension files (the folder with `manifest.json`)
   - The extension should now appear in your extensions list

5. **Verify Installation**
   - You should see the Auto Cookie Rejector extension in your toolbar
   - Visit any website with a cookie consent banner to see it in action

## How It Works

The extension uses EasyList Cookie rules to identify and automatically click "Reject" or "Deny" buttons on cookie consent banners. It:

- Scans the page for common cookie consent containers using EasyList Cookie selectors
- Identifies safe rejection buttons to click
- Has specific support for YouTube's cookie consent banner
- Monitors for dynamically loaded consent banners
- Has multiple fallback methods for different website implementations

## Privacy

This extension does not collect, store, or transmit any personal data. It works entirely locally in your browser and only interacts with cookie consent elements on web pages.

## Troubleshooting

### The extension isn't working on some websites

- Try refreshing the page
- Some websites may use custom cookie consent solutions that aren't yet supported
- Report unsupported websites to help improve the extension

### The extension is causing issues on a specific website

- You can temporarily disable the extension by clicking its icon in the toolbar
- Please report any issues with specific websites

## Contributing

Contributions are welcome! If you'd like to improve the extension or add support for new cookie consent systems:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have suggestions for improvement, please [open an issue](https://github.com/latheesan-k/auto-cookie-rejector/issues) on GitHub.

## Disclaimer

This extension is provided as-is without any warranties. While it aims to automatically reject cookie consent banners, it may not work on all websites or could potentially interact with non-consent elements. Use at your discretion.