# MyHack Snapshot

**Version**: 0.1.0 scaffold  
**Last Updated**: 2026-05-15  
**Status**: Hackathon scaffold with DualBrain module initialized  

## Summary

MyHack is a Next.js 16, React 19, Firebase, and Gemini scaffold for Build With AI 2026 KL. The application currently shows a Team MyHack landing/status page and includes server-side Gemini access, Firebase helpers, Zustand state, Docker support, and Cloud Run deployment automation.

The repository now also includes the DualBrain Module: a Markdown-based agent workflow and memory system that separates long-term docs, strategic phases, working task instructions, and local agent role skills.

## Quick Links

- [Structure](./00_STRUCTURE.md)
- [SRS](./00_SRS.md)
- [Data Schema](./01_DB_SCHEMA.md)
- [Style Guide](./02_STYLE_GUIDE.md)
- [API Contracts](./03_SERVER_ACTIONS.md)
- [Tech Stack](./04_TECH_STACK.md)
- [Detailed Snapshot](./05_PROJECT_SNAPSHOT.md)
- [Dependency Graph](./06_DEPENDENCY_GRAPH.md)

## Active Work

1. Populate environment variables.
2. Bootstrap DualBrain phases from `DB_Module/_PHASES/00_INIT.md`.
3. Replace the scaffold landing/status page with the selected product workflow after topic drop.
