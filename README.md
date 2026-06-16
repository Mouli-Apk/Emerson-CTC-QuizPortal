# Emerson CTC Quiz Portal — v2.0 🚀

A premium, high-tech, and secure React-based web application built for the **Chennai Technology Center (CTC)**. The portal enables employee training, real-time quizzes, and administrative management with state-of-the-art security checks and a stunning modern design.

---

## 🎨 Major Visual Redesign (v2.0)

The interface has been completely overhauled from basic tables to a modern, cybernetic design system:

* **Dynamic Anchored Header & Navbar**: A sticky top navigation bar that blends seamlessly with the page at scroll position zero (transparent background, no borders) for a unified canvas. When scrolled down, it transitions smoothly to a blurred glassmorphic container (`backdrop-filter: blur(12px)`) with a highlighted border to preserve reading legibility, active in both light and dark modes.
* **Dual Ambient Background Glows**:
  * **Dark Mode**: Electric cyan (`#00f2fe`) and deep purple (`#a78bfa`) radial glows behind a rich navy space canvas (`#0d1226`).
  * **Light Mode**: Sleek ice-white and slate canvas with emerald teal accents (`#0d9488`) offering complete WCAG AA contrast compliance (~4.8:1 ratio).
* **Glassmorphism Panels**: Premium translucent layouts featuring subtle borders (`rgba(255, 255, 255, 0.09)`) and drop-shadow elevations.
* **Animated 3D Leaderboard Podium**:
  * The top 3 ranked team members are highlighted on a styled 3D visual stage (1st: Emerald Crown, 2nd: Silver Medal, 3rd: Bronze Medal).
  * **Responsive Collapse**: Automatically stacks into horizontal listing rows on mobile screens under `520px` to keep text and scores legible.

---

## 🔒 Immersive Testing Workspace & Anti-Cheating Security

Built for absolute integrity, the active quiz workspace enforces strict compliance:

1. **Watermark Security Grid**: A low-opacity scrolling watermark repeating the logged-in user's Name and ID across the screen to prevent and trace screenshots.
2. **Strict Tab-Switch Monitoring**: Tab changes or minimizing the browser window triggers a strict visibility strike.
3. **Focus Loss Tracking (Window Blur)**: Leaving the browser window (e.g. clicking off, opening developer tools) triggers a blur strike.
4. **Fullscreen Enforcement**: The quiz runs in full-screen mode. Exiting full-screen triggers a strike.
5. **Strikes Warning Beacon**: Strike indicators light up in hazard rose-red on the active quiz interface to warn candidates of non-compliance. Max strikes submit the test automatically.

---

## ⚙️ Performance & Database Safekeeping

* **Client-Side Image Compression**: Uploaded images for questions are compressed in-browser using HTML5 Canvas, converting them to compact JPEGs (70% quality, max 800px width). This prevents payload errors and keeps uploads fast.
* **Firestore 1MB Payload Safe**: Pre-publish checkers measure the JSON data length of the quiz. If the payload size exceeds 950KB, publishing is blocked with a clear warning to protect Firestore database limits from crashing.
* **Single-Write Locks**: Click-locking buttons prevent duplicate submissions on double-clicks.

---

## 🛠️ Technology Stack

* **Frontend Framework**: React.js (Create React App)
* **Backend Database**: Firebase Firestore
* **Authentication**: Firebase Authentication
* **Styling**: Vanilla CSS3 (Custom Glassmorphism, CSS Variables, and responsive Flex/Grid layouts)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Mouli-Apk/Emerson-CTC-QuizPortal.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Emerson-CTC-QuizPortal
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the development server with hot-reloading:
```bash
npm start
```
The portal will be available at `http://localhost:3000`.

### Production Build

To compile the optimized production bundle:
```bash
npm run build
```
The build artifacts will be saved in the `build/` directory, ready for hosting.
