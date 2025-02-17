# ReadrAI - PDF to Audio Converter

# 🎧 ReadrAI - PDF to Audio Converter

[![Live Website](https://img.shields.io/badge/LIVE_WEBSITE-4484F1?style=for-the-badge&logo=windowsterminal&logoColor=white)](https://readr-dsecdyb7ghgbbpbt.eastus2-01.azurewebsites.net)
[![Demo Video](https://img.shields.io/badge/DEMO_VIDEO-E34F26?style=for-the-badge&logo=youtube&logoColor=white)](https://streamable.com/3yamep)
[![Vite](https://img.shields.io/badge/VITE-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/REACT-00D8FF?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NESTJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MONGODB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Azure](https://img.shields.io/badge/AZURE-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white)](https://azure.microsoft.com/)
[![Tailwind](https://img.shields.io/badge/TAILWIND-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

Live Website: https://readr-dsecdyb7ghgbbpbt.eastus2-01.azurewebsites.net  
Demo Video: https://streamable.com/3yamep

ReadrAI is a sophisticated web application that transforms PDF documents into audio content, providing an accessible way to consume written content through audio. Built with Vite, React, and powered by PlayHT's AI voice generation technology.

## Project Team

- **Developer**: [Sohan Show](https://www.linkedin.com/in/sohanshow/)

- **Project Guidance**:
  - [Mahmoud Felfel](https://www.linkedin.com/in/mahmoud-felfel-33024252/)
  - [Noah Leshan](https://www.linkedin.com/in/noah-leshan/)

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- MongoDB

### Installation

1. Clone the repository

```bash
git clone https://github.com/sohanshow/ReadrAI-frontend.git
```

2. Install dependencies

```bash
cd ReadrAI-frontend
npm install --force
```

3. Configure environment variables

```bash
cp .env.example .env
```

4. Start development server

```bash
npm run dev
```

## Architecture

### Frontend (Vite + React)

- Modern React with hooks
- Tailwind CSS for styling
- Framer Motion for animations
- Socket.IO client for real-time updates

### Backend (NestJS)

- RESTful API architecture
- WebSocket implementation
- MongoDB integration
- JWT authentication
- PDF processing middleware
- PlayHT/ PlayAI

### Cloud Infrastructure (Azure)

- Azure Container Registry (ACR) for container management
- Azure App Service for application hosting
- Azure Blob Storage for file storage
- MongoDB Atlas for database

## Core Features

### Authentication

- Secure email-based OTP verification
- JWT token management
- Session handling

### PDF Processing

- Drag & drop file upload (max 10MB)
- Real-time processing status
- Text extraction and analysis
- Page-by-page audio generation

### Audio Generation

- Multiple voice options
- Progress tracking
- Playback controls
- Auto-play functionality
- Temperature
- Speed
- Seek
- Used PlayDialogue for output. Maybe PlayMini would have been faster.

## Development Timeline (7h 32m)

### Major Components

- Authentication System: 1h 15m
- File Upload & Processing: 1h 45m
- PDF Viewer and Audio Generation: 2h
- PlayAI Audio Chat Bot Per page Integration: 1h 30m
- UI/UX Development: 1h

### Performance Metrics

- Audio Generation: ~5 minutes for 2 pages (PlayMini might reduce this time.)
- PDF Processing: 2-3 seconds per upload
- Text Extraction: 1-2 seconds per page

## Deployment

The application is deployed on Azure Cloud using:

- Azure Container Registry for image management
- Azure App Service for hosting
- CI/CD pipeline for automated deployments

## Technical Considerations

### Audio Generation

- Processing time varies based on text length
- Requires stable internet connection
- Currently supports English text

### PDF Processing

- Maximum file size: 10MB
- Supported format: PDF only
- Real-time progress tracking

### Mobile Responsiveness

- Adaptive layouts for all devices
- Touch-optimized controls
- Fluid typography system

### Thinking about scaling and optimization

- Async PlayDialogue websocket means we can process all pages in parallel.
- Maybe use PlayMini for larger files with more pages.
- Break features down into microservices.

## Conclusion

- All Core requirements + Bonus Reqauirement Done
- PDF Upload, Page Display, Text-to-Speech
- PlayAI Integration, Voice Selection, Temperature, Speed etc
- Added voice chat with page using PlayAI Widget
- Added zoom in zoom out feature for the page.
- Added stateless authentication to store the pdf files and their data
- Clean and modern UI

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
