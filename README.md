# CleanBharat 🇮🇳

## AI-Powered Waste Reporting and Hotspot Intelligence Platform

CleanBharat is an AI-powered waste management platform designed to help citizens report garbage, help collectors prioritize and verify cleanup, and help administrators identify recurring waste hotspots.

The platform goes beyond simple complaint reporting by combining AI-based garbage analysis, context-aware priority, duplicate complaint detection, collection verification, and hotspot intelligence.

---

## 🚨 Problem Statement

India generates a very large amount of municipal waste every day, while a significant portion remains uncollected or improperly disposed.

Traditional garbage complaint systems often focus only on registering complaints.

They do not effectively answer questions such as:

- Which complaint should be handled first?
- Is the complaint near an important location?
- Is this complaint a duplicate?
- Was the garbage actually removed?
- Which areas repeatedly experience garbage problems?
- Where are future waste hotspots likely to emerge?

---

## 💡 Our Solution

CleanBharat creates an end-to-end digital workflow:

Citizen reports garbage
↓
AI analyzes the garbage image
↓
Location is captured
↓
Nearby context can be reported
↓
System calculates priority
↓
Collector sees prioritized complaints
↓
Collector uploads collection proof
↓
AI verifies before/after images
↓
Historical reports are analyzed for hotspot intelligence

---

## ✨ Key Features

### 1. Citizen Garbage Reporting

Citizens can:

- Capture a garbage photo using their mobile camera
- Select an image from their gallery
- Use their current location
- Select garbage type
- Add a description
- Report nearby important locations

---

### 2. AI Garbage Detection

The AI analyzes the uploaded image and provides:

- Garbage detected or not
- Garbage type
- Confidence
- Severity
- Description

---

### 3. Duplicate Complaint Detection

The platform checks nearby previous reports and uses AI to identify whether a similar complaint may already exist.

This helps reduce repeated complaints for the same garbage location.

---

### 4. Context-Aware Waste Priority

CleanBharat does not depend only on garbage severity.

It also considers surrounding context such as:

- Hospitals / Clinics
- Schools
- Colleges / Universities
- Water bodies
- Drains / Sewer channels
- Markets
- Residential areas
- Parks
- Transport hubs
- Other sensitive locations

This helps identify complaints that may require faster attention.

---

### 5. Collector Dashboard

Collectors have a dedicated dashboard with:

- Dashboard overview
- Pending reports
- Collection history
- Priority-based report sorting
- Location context
- AI analysis
- Collection proof upload

---

### 6. AI Collection Verification

After collecting garbage, the collector uploads proof.

The AI compares the before and after images to determine whether the garbage was actually removed.

---

### 7. Hotspot Intelligence

CleanBharat groups nearby reports into hotspots.

The system analyzes:

- Number of reports
- High-priority complaints
- Medium-priority complaints
- Sensitive locations
- Hospitals
- Water bodies
- Pending reports

The hotspot receives a risk score and risk level.

---

### 8. Risk Scoring

Current hotspot risk levels are:

| Risk Score | Risk Level |
|---|---|
| 9+ | Critical |
| 6–8 | High |
| 3–5 | Medium |
| 0–2 | Low |

The score is based on the concentration and severity of reports and surrounding location context.

---

## 👥 User Roles

### Citizen

Can:

- Report garbage
- Upload/capture images
- Detect current location
- Check duplicate complaints
- View reports
- Rate collection

### Collector

Can:

- View pending reports
- Prioritize reports
- Upload collection proof
- Complete garbage collection
- View collection history

### Admin

Can:

- View overall analytics
- Monitor waste hotspots
- Analyze report patterns
- Monitor system activity

---

## 🧠 AI Features

CleanBharat uses AI for:

1. Garbage detection
2. Garbage classification
3. Severity estimation
4. Confidence estimation
5. Description generation
6. Duplicate complaint detection
7. Before/after collection verification

---

## 🗺️ Hotspot Intelligence

The platform identifies clusters of garbage reports within nearby locations.

Repeated reports in the same area can indicate a recurring waste problem.

This allows CleanBharat to move from:

**Complaint Management**

to:

**Waste Hotspot Intelligence**

---

## 🛠️ Technology Stack

### Frontend

- React
- Vite
- JavaScript
- React Router
- CSS

### Backend

- Node.js
- Express.js

### Database

- MongoDB Atlas

### AI

- Google Gemini API

### Deployment

- Vercel — Frontend
- Render — Backend
- MongoDB Atlas — Database

### Development

- Visual Studio Code
- Git
- GitHub

---

## 📁 Project Structure

```text
ai-waste-platform/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   └── package.json
│
├── backend/
│   ├── models/
│   ├── server.js
│   └── package.json
│
└── README.md