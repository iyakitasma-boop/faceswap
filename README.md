# FaceForge AI — Neural Face Swap

A premium, production-ready AI face swap web application built with **Next.js 14** and **Replicate API**.

## ✨ Features
- 🧠 Real AI face swap (not a simulation) using `lucataco/faceswap` model on Replicate
- 💎 Premium dark UI with glassmorphism, neon accents, and smooth animations
- 🖼️ Before/After drag comparison slider
- 📱 Fully responsive (mobile, tablet, desktop)
- 🖱️ Custom cursor with fluid tracking
- ⚡ Drag & drop image uploads
- 📥 Download result image

## 🚀 Quick Start

### 1. Get a Replicate API Key (Free)
1. Create a free account at [replicate.com](https://replicate.com)
2. Go to [Account → API Tokens](https://replicate.com/account/api-tokens)
3. Generate a new token

### 2. Setup
```bash
# Install dependencies
npm install

# Configure API key
echo "REPLICATE_API_TOKEN=r8_your_token_here" > .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Production Build
```bash
npm run build
npm start
```

## 🔧 Environment Variables
| Variable | Description |
|----------|-------------|
| `REPLICATE_API_TOKEN` | Your Replicate API token (required) |

## 🤖 AI Model
This app uses [`lucataco/faceswap`](https://replicate.com/lucataco/faceswap) on Replicate.
- **Input**: Source face image + Target body image
- **Output**: Target image with source face swapped in
- **Processing time**: ~15-40 seconds

## 📁 Project Structure
```
faceswap-ai/
├── app/
│   ├── api/faceswap/route.ts   # API endpoint
│   ├── page.tsx                # Main UI
│   ├── layout.tsx              # App layout
│   └── globals.css             # Styles
├── .env.local                  # API keys (create this)
├── next.config.js
├── tailwind.config.js
└── package.json
```

## ⚠️ Important Notes
- For best results, use clear, front-facing portrait photos
- Face should be clearly visible and well-lit
- Supported formats: JPG, PNG, WEBP (max 10MB)
- Use responsibly and ethically

## 💰 Pricing
Replicate charges per prediction. Face swap typically costs ~$0.005-0.015 per image. Free tier available.
