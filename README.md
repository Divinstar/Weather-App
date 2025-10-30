# 🌦️ Weather App

A clean and responsive weather forecasting app built with **React**, **Vite**, **Tailwind CSS**, and **FastAPI**.  
It fetches live weather data based on user input or current location.

---

## 🚀 Features

- Search weather by city or use your current location 🌍  
- Displays temperature, humidity, pressure, and wind speed 🌡️  
- Animated weather icons and dynamic backgrounds ☁️  
- Fully responsive (works on mobile, tablet, and desktop) 📱  
- FastAPI backend for API integration ⚡  

---

## 🧰 Tech Stack

**Frontend:** React, Vite, Tailwind CSS  
**Backend:** FastAPI (Python)  
**API Source:** Open Metro API  
**Version Control:** Git & GitHub  

---

## 📁 Project Structure

weather-app/
│
├── backend/
│ ├── main.py
│ ├── requirements.txt
│
├── frontend/
│ ├── src/
│ ├── package.json
│
└── README.md


---

## ⚙️ Setup & Installation

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Divinstar/Weather-App.git
cd Weather-App

2️⃣ Setup Backend
cd backend
python -m venv venv
venv\Scripts\activate   # or source venv/bin/activate on Mac/Linux
pip install -r requirements.txt
uvicorn main:app --reload

3️⃣ Setup Frontend
cd ../frontend
npm install
npm run dev


