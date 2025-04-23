# Translation Reviewer

A standalone web application for reviewing, comparing, and correcting translations between English and any target language. This tool helps translators and developers ensure high-quality translations by providing an intuitive interface for reviewing and correcting JSON translation files.



## Features

- **File Upload**: Drag and drop or browse to upload English and target language JSON files
- **Support for Any Language**: Compare English with any target language
- **Missing Keys Detection**: Identifies keys that exist in one file but not the other
- **Interactive Review Interface**: Easily navigate through translations with keyboard shortcuts
- **Correction Tools**: Edit translations directly in the interface
- **Progress Tracking**: Visual progress indicator and section-based navigation
- **Dark Mode**: Comfortable viewing in any lighting condition
- **Export**: Export the corrected translations as a combined JSON file
- **Session Persistence**: Automatically saves your progress to local storage
- **Standalone Operation**: Works entirely in the browser with no server requirements

## Getting Started

### Installation

1. Clone this repository:
   \`\`\`bash
   git clone https://github.com/yourusername/translation-reviewer.git
   cd translation-reviewer
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

\`\`\`bash
npm run build
\`\`\`

You can then deploy the `out` directory to any static hosting service.

## Usage Guide

### Uploading Files

1. On the home screen, upload your English JSON file
2. Select the target language from the dropdown or enter a custom language name
3. Upload your target language JSON file
4. Click "Process Files" to begin

### Reviewing Translations

- Use the navigation buttons or keyboard shortcuts to move between translations
- Click "Pass" if the translation is correct
- Click "Review" to edit a translation that needs correction
- Use the section dropdown to jump to specific sections of your translations

### Missing Keys

If the application detects keys that exist in one file but not the other, it will show a "Missing Keys" button in the header. Click this to view a detailed report of all missing keys.

### Exporting

Once you've reviewed your translations, click the "Export JSON" button to download the combined and corrected translation file.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| → | Next translation |
| ← | Previous translation |
| ↑ | Review translation |
| ↓ | Pass translation |
| Ctrl+Z | Undo last action |
| Esc | Exit preview mode |

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [next-themes](https://github.com/pacocoursey/next-themes) - Theme management
- [Lucide React](https://lucide.dev/) - Icon library

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/) for the amazing React framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- All contributors who have helped shape this project
