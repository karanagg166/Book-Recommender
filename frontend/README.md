# 📚 Book Recommendation System

A full-stack Book Recommendation App that suggests books based on genre input using TF-IDF and Cosine Similarity.

---

## 🧠 Tech Stack

| Layer     | Tech Used                                  |
|-----------|---------------------------------------------|
| ⚙️ Backend  | FastAPI, Python, Scikit-learn, Pandas        |
| 💻 Frontend | Next.js, Tailwind CSS, Framer Motion         |
| 🧠 ML Model | TF-IDF Vectorizer + Cosine Similarity       |
| 🗃️ Data     | `books.csv` (genre + title dataset)          |

---

## 📁 Project Structure

```
book-recommender/
├── backend/                 # 🧠 FastAPI + ML backend
│   ├── main.py              # 🚀 API entry point
│   ├── recommender.py       # 📊 Recommender logic
│   └── books.csv            # 📚 Book dataset
├── frontend/                # 💻 Next.js + Tailwind frontend
│   ├── pages/               # 📄 Pages
│   ├── styles/              # 🎨 Global Tailwind styles
│   ├── components/          # 🧩 Reusable components
│   └── ...                  # 🔧 Other frontend files
```

---

## ⚙️ Backend Setup – FastAPI

### 🧰 Prerequisites

- Python 3.8+
- pip

### 📦 Install Dependencies

```bash
cd backend
pip install -r requirements.txt

```

### 🚀 Run the FastAPI Server

```bash
uvicorn main:app --reload
```

### ✅ Test the API

Visit in your browser:

```
http://localhost:8000/recommend?genre=fantasy
```

You should see:

```json
{
  "recommendations": ["Book 1", "Book 2", "Book 3", ...]
}
```

---

## 💻 Frontend Setup – Next.js + Tailwind CSS

### 🧰 Prerequisites

- Node.js (v18+ recommended)
- npm

### 📦 Install Dependencies

```bash
cd frontend
npm install
```

### 🚀 Start Development Server

```bash
npm run dev
```

Visit in your browser:

```
http://localhost:3000
```

You can now type a genre and see recommended books instantly!

---

## 🎨 Frontend Features

- ✅ Tailwind CSS for styling
- 🌙 Dark mode support
- ✨ Framer Motion animations
- 🔔 Sonner toast notifications
- 🖼 Lucide + React Icons
- 📦 Modular component structure

---

## 🔁 How It Works

1. User enters a genre (e.g. `fantasy`, `romance`)
2. Frontend calls the backend:  
   `GET /recommend?genre=xyz`
3. Backend loads `books.csv`, uses TF-IDF to find top matching books
4. Returns a list of book titles
5. UI renders the recommendations 🎉

---

## 🚀 Future Improvements

- ⬇️ Dropdown genre selector
- ➕ Multi-genre input support
- ❤️ Save favorites or history
- ☁️ Deploy: Vercel (frontend) + Render (backend)
