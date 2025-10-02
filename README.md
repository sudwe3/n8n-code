# N8N Code Editor

A lightweight desktop editor for n8n workflow JSON files, built with Electron and Monaco Editor.

![N8N Code Editor](screenshot.png)

## Features

- **Direct N8N API Access**: Open your own workflows directly from the editor. Real time sync
- **Tree View**: Browse workflow nodes organized by type
- **Node Search**: Find nodes quickly by name, type, or category
- **Monaco Editor**: Full syntax highlighting for JSON and JavaScript
- **Code Tab**: Dedicated JavaScript editor for code nodes with proper formatting
- **Drag & Drop**: Drop JSON files directly into the app
- **Keyboard Shortcuts**: Save with Cmd/Ctrl+S
- **Unsaved Changes Warning**: Visual indicator and prompts before closing
- **Export/Import**: Easy workflow management

## Installation

```bash
git clone https://github.com/sudwe3/n8n-code.git
cd n8n-code
npm install
```

## Usage

### Development Mode

```bash
npm run electron:dev
```

### Build

```bash
npm run build        # macOS
npm run build:win    # Windows
npm run build:linux  # Linux
npm run build:all    # All platforms
```

The build files will be in the `dist/` folder.

### Opening Workflows

1. Click "Open" button
2. Drag and drop a `.json` file into the window
3. Double-click a `.json` file (after building the app)

### Editing

- Use the search bar to find nodes quickly
- Click on any node in the tree to edit its JSON
- For code nodes, use the "Code" tab for JavaScript editing
- Save changes with the "Save" button or Cmd/Ctrl+S
- Unsaved changes are indicated with an orange dot

## Project Structure

```
n8n-code/
├── main.js
├── preload.js
├── package.json
├── electron/
│   ├── window.js
│   └── ipc-handlers.js
└── src/
    ├── index.html
    ├── index.js
    ├── App.jsx
    ├── components/
    │   ├── Icons.jsx
    │   ├── Sidebar.jsx
    │   ├── TreeView.jsx
    │   ├── TopBar.jsx
    │   └── EditorPanel.jsx
    ├── hooks/
    │   ├── useWorkflow.js
    │   └── useFileOperations.js
    └── utils/
        ├── workflowParser.js
        └── codeExtractor.js
```

## Requirements

- Node.js 16+
- npm 7+

## Technologies

- Electron 28
- React 18
- Monaco Editor
- Tailwind CSS

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## Acknowledgments

Built for editing [n8n](https://n8n.io) workflows.