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

![City Explorer Desktop View](https://i.imgur.com/0kE8z7P.png)  
*Three-panel layout: Info | Map | Chat*

![Interactive Map with Marker](https://i.imgur.com/5zL3vXr.png)  
*Leaflet map with smooth fly-to and popup*

![Location Details Panel](https://i.imgur.com/9pQjF8k.png)  
*Rich location information display*

![Chat Interface](https://i.imgur.com/X7mN2vL.png)  
*Conversational search experience*

![Mobile View](https://i.imgur.com/8rTqW9m.png)  
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
