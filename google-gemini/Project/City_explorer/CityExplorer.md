# City Explorer 🌍

An interactive, chat-based map explorer built with React and Leaflet. Simply type a city, landmark, street address, or any place (e.g., "Eiffel Tower", "Times Square New York", "Taj Mahal"), and the app instantly geocodes it using OpenStreetMap's Nominatim service, flies the map to the location, marks it with a popup, and shows detailed information.

The app features a clean, responsive three-panel layout: **Location Info**, **Interactive Map**, and **Chat Assistant** — perfect for exploring the world in a fun, conversational way.

## Features

- **Chat-Driven Exploration**  
  Natural chat interface to search locations — just type and send.

- **Interactive Leaflet Map**  
  Smooth fly-to animations, marker with popup, OpenStreetMap tiles.

- **Detailed Location Panel**  
  Shows full address, coordinates (lat/lon), place type, city, country, street, etc.

- **Responsive Design**  
  Mobile-friendly (stacked layout on small screens) with smooth desktop three-column view.

- **Real-Time Feedback**  
  "Locating..." indicator, helpful error messages, and suggestions.

- **No API Key Required**  
  Uses public Nominatim (OpenStreetMap) geocoding — works out of the box.

## Screenshots

*(Click any image to view full size)*

![City Explorer Desktop View](https://github.com/Ritik574-coder/Vibe-Coding-Project/blob/main/google-gemini/Project/City_explorer/image/Overview.png)  
*Three-panel layout: Info | Map | Chat*

![Interactive Map with Marker](https://github.com/Ritik574-coder/Vibe-Coding-Project/blob/main/google-gemini/Project/City_explorer/image/Section.png)  
*Leaflet map with smooth fly-to and popup*

![Location Details Panel](https://github.com/Ritik574-coder/Vibe-Coding-Project/blob/main/google-gemini/Project/City_explorer/image/map%20view.png)  
*Rich location information display*

![Chat Interface](https://github.com/Ritik574-coder/Vibe-Coding-Project/blob/main/google-gemini/Project/City_explorer/image/Chat%20section.png)  
*Conversational search experience*

![Mobile View](https://github.com/Ritik574-coder/Vibe-Coding-Project/blob/main/google-gemini/Project/City_explorer/image/Location%20info.png)  
*Stacked responsive layout on mobile*

*Replace these placeholders with your own screenshots for the most accurate showcase!*

## Tech Stack

- **Frontend**: React, TypeScript  
- **Map**: Leaflet (dynamically loaded)  
- **Geocoding**: Nominatim (OpenStreetMap public API)  
- **Styling**: Tailwind CSS (inline classes)  
- **Icons**: Lucide React  

## Prerequisites

- Node.js (v18 or later recommended)

## Installation & Setup

1. Clone the repository
