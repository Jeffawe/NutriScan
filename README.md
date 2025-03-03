# ScanMyFood Web App

Welcome to the **ScanMyFood Web App**, where you can scan food items and retrieve nutritional information powered by the **US Food Database**. This web app utilizes both **machine learning** models and **neural networks** to provide insights into the nutritional content of food, along with an image-to-text model for analyzing food images. 

### 🚀 **Live Demo**
You can access the live web app by clicking [here](YOUR_VERCEL_URL). Try uploading food items and see nutritional details instantly!

### 🛠 **Tech Stack**
- **Frontend**: 
  - Built with [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for fast development and optimal performance.
  - TypeScript for type safety and better developer experience.
  
- **Backend**: 
  - [Django](https://www.djangoproject.com/) powers the backend, handling requests and serving the API endpoints for nutritional data.
  - The backend integrates with the **US Food Database** to retrieve up-to-date nutritional information for various food items.

- **Machine Learning**:
  - **Convolutional Neural Network (CNN)**: Used for food classification and data extraction.
  - **Neural Network-based Image-to-Text Model** (Name TBD): Extracts nutritional information and food descriptions from images.

### 📦 **Features**
- **Food Analysis**: Enter or upload food items, and the app will display detailed nutritional information, including daily value percentages.
- **Image-to-Text**: Upload food images, and the app will extract nutritional data from the image using a neural network model.
- **Top Nutrients**: View the key minerals and vitamins based on their daily value percentage.
- **US Food Database Integration**: Get access to real-time data from the official US Food Database for accurate and reliable information.

### 🔧 **How It Works**
1. The user inputs food data via text or by uploading an image of the food item.
2. The app queries the **US Food Database** to fetch nutritional data.
3. For images, the app uses a **neural network-based image-to-text model** to extract information from food images.
4. Nutritional details like vitamins, minerals, and daily value percentages are displayed in an easy-to-read format.
5. Users can also explore nutritional charts and insights about their food.

### ⚙️ **Technologies Used**
- **Frontend**: React, Vite, TypeScript
- **Backend**: Django
- **Machine Learning**: CNN for food classification, Neural Network for image-to-text conversion
- **API**: US Food Database API for nutritional data
