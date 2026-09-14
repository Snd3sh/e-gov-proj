# D-GEAR Nepal 🇳🇵

## Digital Government Accessibility and E-Service Readiness Mapping System

D-GEAR Nepal is a GIS-based decision-support prototype designed to assess, visualize, and compare the digital government and e-service readiness of municipalities across Nepal.

The system combines municipality-level assessment data with geographical visualization and a web-based dashboard to help identify digital readiness gaps and municipalities that may require priority intervention.

---

## 📌 Project Overview

Digital government services are becoming increasingly important for delivering public services efficiently and transparently. However, municipalities across Nepal may have different levels of:

- Internet and connectivity access
- Digital infrastructure
- Digital literacy
- Availability of electronic government services
- ICT human resources
- Digital inclusion and accessibility
- Data management capability

D-GEAR Nepal provides a centralized dashboard for assessing these factors and presenting the results in an understandable and actionable format.

The system is designed as an **academic prototype and decision-support system**, not as an official Government of Nepal platform.

---

## 🎯 Objectives

The main objectives of D-GEAR Nepal are:

1. Assess digital-government readiness at the municipal level.
2. Organize municipality and province information in a centralized system.
3. Calculate and display digital readiness scores.
4. Visualize municipality readiness geographically using a Nepal map.
5. Identify municipalities requiring priority attention.
6. Provide municipality-level assessment details.
7. Improve accessibility of the dashboard for different users.
8. Support data-driven decision-making and planning.

---

## ✨ Main Features

### 📊 Dashboard

The dashboard provides an overview of municipality-level digital readiness, including:

- Total municipalities
- Readiness statistics
- Readiness levels
- Overall assessment information
- Priority municipalities

---

### 🗺️ GIS Map

The system provides a geographical visualization of municipalities across Nepal.

The map allows users to understand the geographical distribution of digital-government readiness.

---

### 🏛️ Province and Municipality Information

Municipalities are associated with their respective provinces.

Users can view:

- Municipality name
- Province
- Municipality location
- Readiness score
- Readiness percentage
- Readiness level

---

### 🔎 Municipality Search

Users can search for a particular municipality and inspect its readiness information.

---

### 📋 Municipality Assessment

Selecting a municipality can display its individual assessment dimensions:

- Connectivity
- Digital Infrastructure
- Digital Literacy
- E-Service Availability
- ICT Human Resources
- Digital Inclusion
- Data Management

The system can also display the municipality's overall readiness score and readiness level.

---

### 🔔 Priority Notifications

The dashboard identifies municipalities that require priority attention based on their readiness results.

Users can select the notification to see which municipalities require attention.

---

### ♿ Accessibility Tools

D-GEAR includes an accessibility panel with controls such as:

- Text Size
- High Contrast
- Text Alignment
- Color Filter
- Text Spacing
- Line Height
- Font Selection
- Saturation
- Dyslexia-Friendly Mode
- Bigger Cursor
- Hide Images
- Pause Animations

These features help make the dashboard more accessible to users with different visual and reading requirements.

---

### ⚙️ Settings

The system includes a settings section for dashboard and accessibility preferences.

---

## 🧮 Digital Readiness Assessment

D-GEAR evaluates digital-government readiness using multiple assessment dimensions.

The main dimensions are:

| Dimension | Purpose |
|---|---|
| Connectivity | Measures availability and quality of digital connectivity |
| Digital Infrastructure | Evaluates ICT and digital infrastructure |
| Digital Literacy | Considers the ability to use digital technologies |
| E-Service Availability | Evaluates availability of digital government services |
| ICT Human Resources | Considers availability of ICT personnel |
| Digital Inclusion | Considers accessibility and inclusion |
| Data Management | Considers the municipality's ability to manage digital data |

The dimensions are combined to produce an overall readiness result.

---

# 🏗️ System Architecture

```text
                    D-GEAR Nepal
                         │
                         ▼
                 ┌───────────────┐
                 │ React Frontend│
                 │    + Vite     │
                 └───────┬───────┘
                         │
                     REST API
                         │
                         ▼
                 ┌───────────────┐
                 │ Node.js +     │
                 │ Express       │
                 └───────┬───────┘
                         │
                     PostgreSQL
                         │
                         ▼
                 ┌───────────────┐
                 │   D-GEAR      │
                 │   Database    │
                 └───────────────┘
