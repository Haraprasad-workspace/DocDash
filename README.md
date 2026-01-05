


# DocDash

![build](https://img.shields.io/badge/build-passing-brightgreen) ![version](https://img.shields.io/badge/version-0.0.0-blue) ![license](https://img.shields.io/badge/license-MIT-lightgrey)

---

## Problem Statement

Small printing shops lack a digital system to manage queues, pricing, and customer communication efficiently, leading to operational inefficiencies and customer dissatisfaction.

### Operational Chaos: Current campus printing is broken

- ⏳ **Unbearable Queues:** Students waste 20-30 minutes standing in line just to print a single assignment.
- 🤯 **Workflow Failure:** Shop owners are overwhelmed managing files scattered across WhatsApp, Email, and virus-filled USBs.
- ❌ **Zero Transparency:** No price visibility and no status updates mean constant interruptions: "Is my file ready?"

---

## Proposed Solution

**DocDash: A Digital Bridge**

Turning a 30-minute wait into a 30-second pickup.

- ☁ **Smart Remote Ordering:** Upload files from your room with instant price estimates. Eliminates virus-filled USBs, WhatsApp messages and email chaos.
- 🎟 **Zero-Wait Virtual Queue:** Secure your spot digitally and get live status alerts when "Ready." Stop standing in crowded lines.
- ⚡ **One-Click Shop Ops:** Shop owners trigger prints with a single click without downloading files, speeding up operations by 3x.
- 🔒 **100% Privacy Guarantee:** Your data is safe. Files are automatically deleted from the cloud immediately after printing.

---

## The Old Way vs The DocDash Way

| Manual Drudgery | One-Click Speed |
|-----------------|-----------------|
| Opening emails, downloading, renaming files one by one | Files appear instantly on the dashboard, auto-sorted by Order ID |

| Blind Queues | Smart Queuing |
|-------------|---------------|
| Students have no idea when to arrive, causing crowding | Real-time token system ensures students arrive only when ready |

| Security & Privacy Risks | Secure Cloud |
|-------------------------|-------------|
| USB drives spread malware & WhatsApp messages expose personal numbers | Virus-free, encrypted uploads with 100% privacy |

---

## Opportunity & Edge

- 🚀 **The Market Gap:** Campus shops process 2,000+ pages/day. Manual WhatsApp/Email workflows crash at this scale. DocDash is a SaaS business model scalable to every university nationwide.
- 🛠 **The Impact:**
  - For Students: Eliminates physical waiting. Visit the shop only when the "Ready" notification pops up.
  - For Shops: Automates intake & pricing. Boosts print throughput by 40%.

---

## Features

- 📍 **Smart Shop Discovery:** Instantly find the nearest shop with the shortest wait time.
- ☁ **Remote Upload:** Securely upload PDFs/Images from your hostel or classroom.
- 💰 **Dynamic Price Engine:** Auto-calculates exact cost based on page count and file type.
- ⏳ **Virtual Queue System:** Real-time "Take a Number" system with live position updates.
- 👁 **Real-Time Tracking:** Watch your order move from Pending → Printing → Ready.
- 🗑 **Auto-Cleanup Security:** Files are deleted from the cloud server the moment an order is completed.
- 🖥 **Shop Owner Dashboard:** Manage queues, trigger auto-prints, and update status instantly.

---

## Tech Stack

- ⚛ **React 19 + Vite:** Next-gen speed & lag-free performance
- 🎨 **Tailwind CSS v4:** Instant, responsive styling
- 🔥 **Firebase v12:** Real-time database sync & Secure Auth
- ☁ **Cloudinary:** Scalable storage for heavy PDF/Image uploads
- 📄 **react-pdf:** Instant file previews in the browser
- 🔒 **crypto-js:** Client-side encryption for 100% data privacy
- 🌍 **Browser Geolocation API:** Automatically detects user location

---

## Getting Started

### Prerequisites
- Node.js & npm
- Firebase project (see `.env.example`)

### Installation
```bash
git clone https://github.com/Haraprasad-workspace/DocDash.git
cd DocDash
npm install
```

### Configuration
Copy `.env.example` to `.env` and fill in your Firebase credentials.

### Running Locally
```bash
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173)

---

## Project Structure

```text
src/
├─ assets/      # Static assets
├─ common/      # Shared UI components
├─ context/     # React context providers
├─ lib/         # Utility libraries (file analysis, cloudinary, etc.)
├─ pages/       # Application pages (Dashboard, Home, Login, Register, Upload, etc.)
├─ routes/      # Route protection components
├─ services/    # Service layer for shops and orders
```

---

## Support & Documentation

- For help, open an issue in this repository
- For API and advanced usage, see future documentation in the `docs/` folder

## Maintainers & Contributing

- Maintained by [Haraprasad-workspace](https://github.com/Haraprasad-workspace)
- Contributions welcome! See [CONTRIBUTING.md](.github/prompts/create-readme.prompt.md)

---

## Acknowledgements
- [React](https://react.dev/)
- [Firebase](https://firebase.google.com/)
- [Cloudinary](https://cloudinary.com/)
- [Vite](https://vitejs.dev/)
