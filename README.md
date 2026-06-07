# English Fantasy

An interactive English learning adventure game combining educational content with engaging gameplay mechanics.

## 📋 Overview

English Fantasy is a web-based learning platform that helps users improve their English through:
- **Dungeon Exploration** - Navigate through interactive dungeons
- **Battle System** - Engage in strategic combat scenarios
- **Story Mode** - Follow narrative-driven quests
- **Vocabulary Building** - Learn and practice English vocabulary
- **Character Management** - Create and manage your character profile

## 📁 Project Structure

```
english-fantasy/
├── src/                        # Frontend application assets
│   ├── html/                   # Static pages and UI templates
│   ├── css/                    # Global styles and layout rules
│   ├── js/                     # Client-side JavaScript logic
│   │   └── ai-agent.js         # AI agent prototype for RAG / LangChain workflows
│   └── assets/                 # Media and data resources
│       ├── images/             # Game artwork and icons
│       └── data/               # Vocabulary, level data, and configuration
├── server/                     # Local server and backend utilities
│   ├── package.json            # Server dependencies and scripts
│   └── *.js                    # Server-side scripts and helpers
├── database/                   # Database schema and migration scripts
├── scripts/                    # Build / seed / generation utilities
├── docs/                       # Design notes and project documentation
│   ├── DESIGN.md
│   └── AI_ARCHITECTURE.md      # AI integration design: RAG, LangChain, Agent
├── dev-server.bat              # Windows launch helper
├── dev-server.sh               # Unix launch helper
├── package.json                # Project metadata and scripts
├── README.md                   # Project overview and instructions
└── .gitignore                  # Files excluded from version control
```

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Optional: Node.js for local server setup

### Running Locally

1. **Using Python (built-in):**
   ```bash
   # Python 3.x
   python -m http.server 8000 --directory src
   
   # Python 2.x
   python -m SimpleHTTPServer 8000
   ```
   Then visit `http://localhost:8000/html/index.html`

2. **Using Node.js:**
   ```bash
   npm install -g http-server
   npm run serve
   ```

3. **Using included helper scripts (Windows / Unix):**
    Run the helper scripts from the project root. Below are explicit `cd` examples so you can run them from any location.

    - Windows (PowerShell or Command Prompt) — change to the project folder then run:
       ```powershell
       cd "E:\Antigravity\English Fantasy"
       .\dev-server.bat
       ```
http://localhost:8000/html/index.html
    - macOS / Linux — change to the project folder then run:
       ```bash
       cd /path/to/english-fantasy
       chmod +x dev-server.sh
       ./dev-server.sh
       ```

    - Serve the `src` folder directly with Python (from anywhere):
       ```bash
       cd /d "E:\Antigravity\English Fantasy\src"
       python -m http.server 8000
       ```

    - Serve the `src` folder with Node (using npx/http-server):
       ```bash
       cd /d "E:\Antigravity\English Fantasy"
       npx http-server src -p 8000
       ```

    After starting the server, open `http://localhost:8000/html/index.html` in your browser.

4. **Direct File Access:**
   - Simply open `src/html/index.html` in your browser

## 📚 Content Structure

### Game Levels
- **Floor 1** - Introduction and basic vocabulary
- Additional floors and content available in `src/assets/data/vocabulary/`

### Asset Organization
- **Images**: Organized by gameplay section in `src/assets/images/`
- **Data**: Game logic and vocabulary in `src/assets/data/`

## 🛠️ Development

### Adding New Features
1. Create HTML files in `src/html/`
2. Add styles to `src/css/style.css` or create new CSS files
3. Add JavaScript modules in `src/js/`
4. Update paths if structure changes

### Asset Guidelines
- Place all images in `src/assets/images/`
- Organize by game section (dungeon, story_mode, etc.)
- Keep file sizes optimized for web
- Use descriptive filenames

### CSS Path References
- From HTML: `../css/style.css`
- From root: `src/css/style.css`

## 💻 Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📖 Pages Reference

| Page | Path | Purpose |
|------|------|---------|
| Index | `index.html` | Main landing and navigation hub |
| Dashboard | `dashboard.html` | User account and progress overview |
| Battle | `battle.html` | Combat encounter system |
| Dungeon | `dungeon.html` | Dungeon exploration interface |
| Profile | `profile.html` | Character information and stats |

## 🎯 Future Enhancements
- [ ] Multiplayer functionality
- [ ] Backend API integration
- [ ] Progressive Web App (PWA) support
- [ ] Mobile app version
- [ ] Advanced analytics and progress tracking
- [ ] Leaderboards and achievements

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for any bugs or feature requests.

## 📧 Support

For support, questions, or feedback, please open an issue in the repository.

---

**Last Updated**: June 2026  
**Version**: 1.0.0  
**Status**: Active Development
