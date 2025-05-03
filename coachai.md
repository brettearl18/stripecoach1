# Coach Dashboard AI Data Flows & Insights (CTO Reference)

---

## UI/UX Build To-Do List

- [ ] **Business Overview (AI) Card**
  - Design a visually prominent card for high-level business health, trends, and alerts.
- [ ] **Client Overview (AI) Card**
  - Create a card summarizing client segmentation and engagement trends.
- [ ] **Client of the Week (AI) Card**
  - Highlight a selected client with their achievement and a short summary.
- [ ] **Wins & Losses (AI) Card**
  - Display recent wins and setbacks, with icons or color cues for each.
- [ ] **What to Focus On (AI) Card**
  - Show top priorities and actionable suggestions for the coach/team.
- [ ] **Clients to Check On (AI) Card**
  - List at-risk clients with reasons and suggested actions.
- [ ] **Clients to Praise (AI) Card**
  - List clients to recognize, with reasons and suggested messages.
- [ ] **Responsive Layout & Polish**
  - Ensure all cards are responsive, visually consistent, and match the dark theme.
- [ ] **Add Loading, Empty, and Error States**
  - Each card should gracefully handle loading, no data, and error scenarios.

---

This to-do list is for the UI/UX coding team to track and implement each dashboard element. Refer to the data flows and AI output sections below for details on what each card should display.

---

## 1. Business Overview (AI)
**Data Inputs:**
- All client check-in data (metrics, answers, trends)
- Revenue, active clients, churn, new signups
- Coach activity (messages sent, feedback given)

**AI Output:**
- High-level summary of business health (growth, engagement, risk)
- Key trends (e.g., client growth, revenue changes)
- Alerts for unusual activity (drop in check-ins, churn spike)

---

## 2. Client Overview (AI)
**Data Inputs:**
- All client profiles and statuses
- Recent check-in completion rates
- Client engagement (messages, logins)

**AI Output:**
- Segmentation (active, at-risk, new, top performers)
- Engagement trends (who's improving, who's slipping)
- Suggestions for client grouping or targeting

---

## 3. Client of the Week (AI)
**Data Inputs:**
- All client progress data (metrics, streaks, achievements)
- Coach feedback and notes

**AI Output:**
- Selects a client to highlight (criteria: improvement, consistency, milestone)
- Short summary of why they were chosen

---

## 4. Wins & Losses (AI)
**Data Inputs:**
- Recent check-in results (metrics, answers)
- Goal completions/failures
- Coach and client feedback

**AI Output:**
- List of recent wins (goals hit, positive trends)
- List of recent losses or setbacks (missed check-ins, negative trends)
- Suggestions for celebrating wins or addressing losses

---

## 5. What to Focus On (AI)
**Data Inputs:**
- All recent check-in and progress data
- Coach's current program focus
- Client feedback and challenges

**AI Output:**
- Top 1-3 priorities for the coach/team this week
- Rationale for each focus area (e.g., "Nutrition adherence dropped 20%")
- Actionable suggestions

---

## 6. Clients to Check On (AI)
**Data Inputs:**
- Clients with missed check-ins, negative trends, or low engagement
- At-risk flags (e.g., streak broken, negative feedback)

**AI Output:**
- List of clients who may need extra support
- Reason for flagging (e.g., "Missed 2 check-ins", "Low mood reported")
- Suggested outreach or intervention

---

## 7. Clients to Praise (AI)
**Data Inputs:**
- Clients with positive trends, streaks, or recent achievements
- Coach notes and feedback

**AI Output:**
- List of clients to recognize or praise
- Reason for selection (e.g., "Hit 4-week streak", "Achieved weight goal")
- Suggested message or celebration

---

**Note:**
- All AI outputs should be explainable and actionable for the coach.
- Data flows should be kept up to date as new features are added (e.g., group messaging, new metrics).
- Use this doc as a living reference for both engineering and product teams. 