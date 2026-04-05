# 🏎️ Car Gallery

A modern, responsive web application for car enthusiasts to upload, view, and curate their favorite vehicles. Built with React and Firebase.

## ✨ Features

* **Cloud Storage & Database:** All cars and images are securely stored in Google Cloud Firestore.
* **Google Authentication:** Users can log in with their Google accounts to manage their uploads.
* **Smart Image Compression:** Automatically resizes and compresses images before upload to optimize storage and loading speeds.
* **AI Content Moderation:** Uses TensorFlow.js (`nsfwjs`) directly in the browser to automatically block inappropriate image uploads.
* **Real-time Sync:** Likes and new uploads sync across all devices instantly.
* **Categorization:** Filter cars by categories like Sports, SUV, and Classic.

## 🛠️ Tech Stack

* **Frontend:** React 19, TypeScript, Vite
* **Styling:** Tailwind CSS, Lucide React (Icons)
* **Backend/Database:** Firebase (Firestore & Authentication)
* **Machine Learning:** TensorFlow.js (`@tensorflow/tfjs`), NSFWJS
* **Deployment:** Netlify

## 🚀 Getting Started (Local Development)

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/uhwhatamityping/CarGallery.git
cd CarGallery
