# ACS Chat Hub

A professional chat interface with MCP compatibility and AI model integration, styled with AUSTENTEL branding.

## Features

- 🤖 **Multi-Model Support**: OpenAI GPT models, Claude, and more
- 💬 **Persistent Chat History**: SQLite database with full-text search
- 🔌 **MCP Integration**: Model Context Protocol support for tool calling
- 📊 **Token Tracking**: Real-time token counting and cost estimation
- 🎨 **Professional UI**: Clean AUSTENTEL-branded interface
- 🐳 **Docker Ready**: Complete containerization with docker-compose

## Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- API keys for OpenAI and/or Anthropic Claude

### Setup

1. **Clone and setup**:
   \`\`\`bash
   git clone <your-repo>
   cd acs-chat-hub
   chmod +x scripts/*.sh
   ./scripts/docker-setup.sh
   \`\`\`

2. **Configure environment**:
   Edit `.env` file with your API keys:
   \`\`\`env
   OPENAI_API_KEY=your_openai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   \`\`\`

3. **Start the application**:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

4. **Access the app**:
   Open http://localhost:3000

### Development Mode

For development with hot reload:
\`\`\`bash
docker-compose -f docker-compose.yml -f docker-compose.override.yml up
\`\`\`

### Database Management

**Backup database**:
\`\`\`bash
./scripts/backup-database.sh
\`\`\`

**View database** (development):
\`\`\`bash
docker-compose --profile dev-tools up sqlite-web
# Access at http://localhost:8080
\`\`\`

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key | Required |
| `MCP_SERVER_URL` | MCP server WebSocket URL | `ws://localhost:8080/mcp` |
| `MCP_ENABLED` | Enable MCP integration | `true` |
| `DATABASE_URL` | SQLite database path | `file:/app/data/chat.db` |

### MCP Configuration

The app supports Model Context Protocol for enhanced AI capabilities:

1. Set `MCP_ENABLED=true` in your `.env`
2. Configure `MCP_SERVER_URL` to point to your MCP server
3. Test connection in Settings → MCP Configuration

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/chats` - List all chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/search?q=query` - Search chats
- `GET /api/chats/[id]/messages` - Get chat messages
- `POST /api/chats/[id]/messages` - Add message to chat

## Docker Commands

**Start services**:
\`\`\`bash
docker-compose up -d
\`\`\`

**View logs**:
\`\`\`bash
docker-compose logs -f acs-chat-hub
\`\`\`

**Stop services**:
\`\`\`bash
docker-compose down
\`\`\`

**Rebuild after changes**:
\`\`\`bash
docker-compose build --no-cache
docker-compose up -d
\`\`\`

**Production deployment**:
\`\`\`bash
docker-compose --profile production up -d
\`\`\`

## Troubleshooting

### Database Issues
- Check volume permissions: `docker-compose exec acs-chat-hub ls -la /app/data`
- Reinitialize: `docker-compose down -v && docker-compose up -d`

### API Connection Issues
- Verify API keys in `.env`
- Check health endpoint: `curl http://localhost:3000/api/health`

### MCP Connection Issues
- Ensure MCP server is running and accessible
- Check WebSocket URL format in settings
- Verify firewall/network configuration

## Development

### Local Development (without Docker)

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Setup environment**:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your API keys
   \`\`\`

3. **Run development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

### Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── *.tsx             # Custom components
├── lib/                  # Utility libraries
│   ├── database.ts       # SQLite operations
│   ├── mcp-client.ts     # MCP integration
│   └── token-counter.ts  # Token counting
├── scripts/              # Database and Docker scripts
├── docker-compose.yml    # Docker configuration
└── Dockerfile           # Container definition
\`\`\`

## License

MIT License - see LICENSE file for details.
\`\`\`

```json file="" isHidden
