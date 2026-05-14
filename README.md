# Privacy Airlock | Full-Stack Media Sharing

A production-ready full-stack application designed for secure media transfer. It features an automatic metadata scrubbing pipeline (The Privacy Airlock) that strips EXIF, GPS, and device identifiers before storage.

## Features

1.  **Privacy Airlock Pipeline**:
    *   **Images**: Strips all EXIF, GPS, camera models, and timestamps using `sharp`.
    *   **Videos**: Binary-level cleaning to remove device-specific metadata tags.
2.  **Unified Data Entry Grid**:
    *   Integrated form for simultaneous multi-media upload and metadata entry (5 text fields + checkbox + date).
    *   Visual previews for images and inline playback for videos.
3.  **Responsive Dashboard**:
    *   Premium glassmorphism design with a high-contrast dark mode.
    *   Real-time data table with visual status indicators.
4.  **Mobile Transfer Hub**:
    *   Minimalist view optimized for low-performance/older devices.
    *   High-contrast, large download buttons.
    *   One-tap "Direct Copy" for all text fields.

## Tech Stack

*   **Frontend/Backend**: Next.js 14 (App Router)
*   **Styling**: Vanilla CSS (Custom Design System)
*   **Image Processing**: `sharp` & `exifreader`
*   **Icons**: `lucide-react`

## Deployment (Vercel)

1.  **Clone the repo**: `git clone <your-repo-url>`
2.  **Install dependencies**: `npm install`
3.  **Run locally**: `npm run dev`
4.  **Deploy**: Push to GitHub and connect to Vercel. 

> [!NOTE]
> For permanent storage in production, integrate an S3 bucket or Cloudinary in `app/api/upload/route.ts`.
