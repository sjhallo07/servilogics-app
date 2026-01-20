#!/bin/bash
# Copilot helper for common tasks

case "$1" in
    "prompts")
        echo "📋 Available Copilot Prompts:"
        grep -A 2 "^## Common" .copilot-prompts.md
        ;;
    "setup")
        echo "🔧 Setup Instructions:"
        echo "1. Install GitHub Copilot extension in VS Code"
        echo "2. Authenticate: Cmd+Shift+P > Copilot: Sign In"
        echo "3. In code: Cmd+I for inline suggestions"
        echo "4. Chat: Cmd+Shift+I for Copilot Chat"
        ;;
    "components")
        echo "🎨 Generate Map Component:"
        echo "Prompt: Create a React component for worker markers on Leaflet map"
        ;;
    "api")
        echo "🔌 Generate API Route:"
        echo "Prompt: Create Express route for updating worker location with validation"
        ;;
    *)
        echo "Copilot Helper - Available Commands:"
        echo "  prompts     - Show available prompts"
        echo "  setup       - Setup instructions"
        echo "  components  - Map component prompt"
        echo "  api         - API route prompt"
        ;;
esac
