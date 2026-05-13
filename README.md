# 🤖 NEXAbot.AI – All‑in‑One AI Platform

**Your personal AI workspace – chat, create, detect, edit, and generate videos, images, and data visualizations.**

[![Live App](https://img.shields.io/badge/Live%20App-Vercel-000)](https://nexa-bot-ai.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend%20API-Render-46E3B7)](https://nexabot-video-api.onrender.com/health)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ All Features at a Glance

| Module               | What It Does                                                                 |
|----------------------|------------------------------------------------------------------------------|
| 💬 **Smart Chat**    | DIY AI engine with persistent conversation history, pinning, archiving       |
| 🧠 **Memory Bank**   | Save important messages, add tags, star ratings, and export/import JSON      |
| 🕵️ **AI Detector**   | Detect AI‑generated text and images with confidence scores                   |
| 🎨 **Image Generation** | Create images from text prompts (AI based)                               |
| ✏️ **Image Editor**  | Basic editing (crop, resize, filters)                                       |
| 📊 **Graphing Tool** | Turn data into charts (line, bar, pie) from CSV or manual input              |
| 🔍 **Image Amplifier** | Upscale images while preserving quality                                  |
| 🎬 **AI Video Studio**| Search royalty‑free videos, add music/text, apply effects, and get shareable links |

---

## 🚀 Live Demo

- **Frontend:** [https://nexa-bot-ai.vercel.app](https://nexa-bot-ai.vercel.app)  
- **Video API Health:** [https://nexabot-video-api.onrender.com/health](https://nexabot-video-api.onrender.com/health)

> *Note: The video studio uses a separate backend (Render free tier). First request may take a few seconds to wake up.*

---

## 🧱 Tech Stack

| Part            | Technologies                                                                 |
|-----------------|------------------------------------------------------------------------------|
| **Frontend**    | React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons                   |
| **Backend (Chat & Tools)** | DIY AI engine, localStorage, Supabase (auth)                         |
| **Video Backend** | Flask, FFmpeg, Supabase Storage, Render, Pixabay API, SoundHelix           |
| **Authentication** | Supabase (Magic Link, Google, GitHub)                                   |
| **Mobile**      | Capacitor (Android APK)                                                     |

---

## 🎬 Video Studio (Crown Jewel)

- **35+ royalty‑free music tracks** (Mixkit + SoundHelix) across 5 moods.  
- **Stock video search** via Pixabay.  
- **Custom assembly** – trim (2‑30s), music overlay, text overlay.  
- **Multi‑clip merge** – combine up to 3 clips.  
- **Effects** – Ken Burns zoom, slow motion, time‑lapse.  
- **Cloud storage** – videos hosted on Supabase, auto‑deleted after 24h.  
- **Shareable URL** – every video gets a permanent link.

**Example API call:**
```bash
curl -X POST https://nexabot-video-api.onrender.com/assemble \
  -H "Content-Type: application/json" \
  -d '{"topic":"nature","video_url":"...","duration":5,"music_url":"...","text_overlay":"Hello"}'