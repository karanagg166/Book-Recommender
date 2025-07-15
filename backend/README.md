# Book Recommender Backend

A modular, production-ready book recommendation system built with FastAPI and scikit-learn.

## 🏗️ Architecture

The backend has been completely refactored from a monolithic 604-line file into clean, focused modules:

```
backend/
├── main.py                    # FastAPI server with endpoints
├── data_loader.py             # Data loading and preprocessing  
├── feature_engineering.py     # Feature creation and scaling
├── sentiment_analysis.py      # Sentiment model training/inference
├── recommendation_engine.py   # Core KNN recommendation engine
├── genre_recommender.py       # Genre-based recommendation interface
├── books.csv                  # Book dataset (11,129 books)
├── requirements.txt           # Python dependencies
└── analysis/                  # Original analysis code
    ├── original_recommender.py
    └── README.md
```

## 🚀 Key Features

- **Genre-based recommendations** - Get book suggestions by genre
- **Content-based filtering** - Uses book features and similarity
- **Sentiment analysis** - Incorporates review sentiment scoring
- **Smart genre detection** - Keywords and patterns for genre classification
- **Quality filtering** - Recommends highly-rated, popular books
- **RESTful API** - Clean FastAPI endpoints with documentation

## 📋 API Endpoints

| Endpoint | Method | Description |
|----------|---------|-------------|
| `/` | GET | API information and available endpoints |
| `/recommend?genre=fantasy` | GET | Get book recommendations by genre |
| `/genres` | GET | List all available genres |
| `/genre/{genre}/info` | GET | Get detailed genre information |
| `/search?q=harry` | GET | Search books by title or author |

## 🎯 Supported Genres

- `fantasy` - Magic, dragons, wizards, Harry Potter, etc.
- `romance` - Love stories, relationships, romantic novels
- `mystery` - Detective stories, crime, thrillers, suspense  
- `science_fiction` - Sci-fi, space, robots, future settings
- `horror` - Scary stories, ghosts, supernatural themes
- `adventure` - Action, journeys, exploration stories
- `biography` - Life stories, memoirs, autobiographies
- `history` - Historical fiction and non-fiction
- `philosophy` - Philosophical works and thought
- `self_help` - Personal development, productivity

## 🔧 Installation & Setup

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Run the server:**
   ```bash
   python main.py
   ```
   
   Server starts at: `http://localhost:8000`

3. **View API documentation:**
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

## 💡 Usage Examples

### Basic Genre Recommendation
```python
import requests

response = requests.get("http://localhost:8000/recommend?genre=fantasy")
books = response.json()["recommendations"]
```

### Python Module Usage
```python
from genre_recommender import recommend_books

# Get fantasy book recommendations
fantasy_books = recommend_books("fantasy", n_recommendations=5)
print(fantasy_books)
```

### Search for Books
```python
response = requests.get("http://localhost:8000/search?q=tolkien")
books = response.json()["books"]
```

## 🧠 How It Works

1. **Data Loading** - Loads 11K+ books with ratings, authors, genres
2. **Feature Engineering** - Creates 25+ features from book metadata
3. **Sentiment Analysis** - Trains logistic regression on review sentiment
4. **Genre Classification** - Maps books to genres using keyword matching
5. **Similarity Computation** - Uses cosine similarity with KNN
6. **Quality Filtering** - Recommends books with good ratings/popularity

## 🔬 Model Details

- **Algorithm**: K-Nearest Neighbors with cosine similarity
- **Features**: Rating categories, languages, popularity metrics, author stats, sentiment scores
- **Sentiment Model**: Logistic regression with n-gram features
- **Scaling**: MinMax normalization for all features

## 📊 Performance

- **Response Time**: ~100-500ms for recommendations
- **Dataset Size**: 11,129 books from Goodreads
- **Feature Dimensions**: 25+ engineered features
- **Genre Coverage**: 10 major genres with keyword mapping

## 🛠️ Refactoring Benefits

**Before**: Monolithic 604-line file with mixed concerns
**After**: 6 focused modules with single responsibilities

✅ **Maintainable** - Easy to understand and modify
✅ **Testable** - Each component can be tested independently  
✅ **Scalable** - New features don't affect existing code
✅ **Production-ready** - Clean API with error handling
✅ **LLM-friendly** - Small, focused files that LLMs can easily edit

## 🚧 Future Enhancements

- [ ] User preference learning
- [ ] Collaborative filtering
- [ ] Real-time model updates
- [ ] Better genre classification (ML-based)
- [ ] Recommendation explanations
- [ ] A/B testing framework 