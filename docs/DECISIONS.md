# Architectural Decision Records

## 2025-01-XX: Project Setup

### Decision: Use IndexedDB for client-side storage
- **Rationale**: No backend needed for MVP, fast local development
- **Alternatives considered**: Supabase, PostgreSQL
- **Trade-offs**: No multi-device sync, but simpler architecture

### Decision: Use Anthropic Claude API for analysis
- **Rationale**: Best-in-class reasoning for complex prompt analysis
- **Alternatives considered**: OpenAI GPT-4
- **Trade-offs**: Single provider dependency

### Decision: No authentication for MVP
- **Rationale**: Focus on core value prop, iterate faster
- **Alternatives considered**: Clerk, NextAuth
- **Trade-offs**: No user accounts, but cleaner scope
