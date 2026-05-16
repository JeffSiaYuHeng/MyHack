# Verrier Snapshot

**Version**: 0.5.1 interaction-polish
**Last Updated**: 2026-05-17
**Status**: Interaction polish complete; AI calls are explicit button/form actions; lint and build passing

## Summary

Verrier is an AI-powered ecosystem relationship management platform for programme administrators. It helps teams create programmes, score startup fit, review applicants, match mentors, monitor mentor-startup relationship health, and generate cohort intelligence.

The application is now a feature-complete MVP with robust client-side resilience, server-side Gemini integration, established Firestore persistence boundaries, button-driven AI actions, a refined toast system, and visible matching-generation loading states.

## Quick Links

- [Structure](./00_STRUCTURE.md)
- [SRS](./00_SRS.md)
- [Data Schema](./01_DB_SCHEMA.md)
- [Style Guide](./02_STYLE_GUIDE.md)
- [API Contracts](./03_SERVER_ACTIONS.md)
- [Tech Stack](./04_TECH_STACK.md)
- [Detailed Snapshot](./05_PROJECT_SNAPSHOT.md)
- [Dependency Graph](./06_DEPENDENCY_GRAPH.md)
- [Data Flow & Backup Path](./07_DATA_FLOW.md)
- [User Flow UI Interaction Report](./08_USER_FLOW_UI_INTERACTION_REPORT.md)
- [Roadmap](../_PHASES/00_ROADMAP.md)

## Active Work

1. Final smoke test of the interaction-polished demo flow.
2. Decide whether to resolve the Next.js workspace-root warning caused by multiple lockfiles.
3. Wire Firestore persistence into programme create/edit/delete routes.
4. Finalize Block D: Pitch Walkthrough Polish and judge-ready documentation.
