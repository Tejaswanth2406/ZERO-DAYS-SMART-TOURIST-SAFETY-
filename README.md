<img width="1983" height="793" alt="image" src="https://github.com/user-attachments/assets/c93625bb-d381-4807-abe6-8190c97532e9" />
# Smart Tourist Safety

A responsive, real-time web application designed to enhance traveler security by providing live location tracking, instant emergency alerts, interactive safety maps, and unified risk management features. Built with modern web technologies, it ensures rapid response times and low latency during critical safety situations.

---

## Features

* **Real-Time Location Monitoring:** Keeps track of tourist positions to ensure safety within designated zones.
* **Instant Emergency Alerts:** Enables users to send immediate distress signals and contact emergency services with a single tap.
* **Interactive Safety Maps:** Visualizes safe zones, high-risk areas, and nearby essential services (hospitals, police stations, safe havens).
* **Unified Contact & Protocol System:** Centralizes local emergency contacts, embassy information, and safety guidelines into one accessible hub.
* **Responsive UI:** Optimized for seamless performance across mobile devices, tablets, and desktop browsers.

---

## Tech Stack

* **Frontend:** React (TypeScript)
* **Build Tool:** Vite
* **Styling:** Tailwind CSS / CSS Modules
* **Mapping/Geolocation:** Leaflet / Google Maps API (or Geolocation API)
* **State Management & Tooling:** React Hooks, ESLint

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:

* **Node.js** (v16.x or higher)
* **npm** or **yarn**

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/your-username/smart-tourist-safety.git
cd smart-tourist-safety

```


2. **Install dependencies:**
```bash
npm install

```


3. **Set up Environment Variables:**
Create a `.env` file in the root directory and add any necessary API keys (e.g., Map services, backend endpoints):
```env
VITE_MAP_API_KEY=your_api_key_here
VITE_BACKEND_URL=http://localhost:5000

```


4. **Run the development server:**
```bash
npm run dev

```


Open `http://localhost:5173` in your browser to view the app.

---

## Build for Production

To create an optimized production build:

```bash
npm run build

```

To preview the production build locally:

```bash
npm run preview

```

---

## License

Distributed under the MIT License. See `LICENSE` for more information.
