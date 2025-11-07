from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from mangum import Mangum
import sys
import os

# Add the parent directory to Python path to find our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import our modular recommendation system
from genre_recommender import recommend_books, get_recommender
from pydantic import BaseModel

app = FastAPI(
    title="Book Recommender API",
    description="A smart book recommendation system based on genres",
    version="2.0.0"
)

# Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize the recommender system at startup."""
    print("🚀 Starting Book Recommender API...")
    print("📚 Initializing recommendation system...")
    
    # Initialize the recommender singleton at startup
    recommender = get_recommender()
    print(f"✅ Recommender initialized with {len(recommender.engine.books_data) if recommender.engine.books_data is not None else 0} books")
    print("🎯 API ready to serve recommendations!")

@app.get("/")
def root():
    """Root endpoint with API information."""
    return {
        "message": "Book Recommender API",
        "version": "2.0.0",
        "endpoints": {
            "/recommend": "Get book recommendations by genre",
            "/genres": "List available genres",
            "/search": "Search for books by title or author",
            "/books/similar": "Get similar books based on a book title"
        }
    }

@app.get("/recommend")
def get_recommendations(genre: str):
    """Get book recommendations for a specific genre."""
    try:
        results = recommend_books(genre)
        return {
            "genre": genre,
            "recommendations": results,
            "count": len(results)
        }
    except Exception as e:
        return {"error": f"Error generating recommendations: {str(e)}"}, 500

@app.get("/genres")
def get_available_genres():
    """Get list of available genres."""
    try:
        recommender = get_recommender()
        genres = recommender.get_available_genres()
        return {
            "genres": genres,
            "count": len(genres)
        }
    except Exception as e:
        return {"error": f"Error fetching genres: {str(e)}"}, 500

@app.get("/genre/{genre}/info")
def get_genre_info(genre: str):
    """Get detailed information about a specific genre."""
    try:
        recommender = get_recommender()
        info = recommender.get_genre_info(genre)
        return info
    except Exception as e:
        return {"error": f"Error fetching genre info: {str(e)}"}, 500

@app.get("/search")
def search_books(q: str):
    """Search for books by title or author."""
    try:
        recommender = get_recommender()
        results = recommender.search_books(q)
        return {
            "query": q,
            "books": results,
            "count": len(results)
        }
    except Exception as e:
        return {"error": f"Error searching books: {str(e)}"}, 500

@app.get("/books/similar")
def get_similar_books(title: str):
    """Get similar books based on a book title."""
    try:
        recommender = get_recommender()
        results = recommender.get_similar_books(title)
        return {
            "title": title,
            "similar_books": results,
            "count": len(results)
        }
    except Exception as e:
        return {"error": f"Error finding similar books: {str(e)}"}, 500

@app.get("/books/popular")
def get_popular_books(
    rating_category: str = None,
    language: str = None,
    min_ratings: int = 1000,
    limit: int = 10
):
    """Get popular books with optional filters."""
    try:
        recommender = get_recommender()
        results = recommender.get_popular_books(
            rating_category=rating_category,
            language=language,
            min_ratings=min_ratings,
            limit=limit
        )
        return {
            "popular_books": results,
            "count": len(results),
            "filters": {
                "rating_category": rating_category,
                "language": language,
                "min_ratings": min_ratings,
                "limit": limit
            }
        }
    except Exception as e:
        return {"error": f"Error fetching popular books: {str(e)}"}, 500

@app.get("/analytics")
def get_analytics():
    """Get analytics about the book dataset."""
    try:
        recommender = get_recommender()
        analytics = recommender.get_analytics()
        return analytics
    except Exception as e:
        return {"error": f"Error fetching analytics: {str(e)}"}, 500

class PreferenceRequest(BaseModel):
    high_rating: bool = None
    popular: bool = None
    language: str = None
    sentiment_positive: bool = None
    genres: list = None

@app.post("/recommend/preferences")
def recommend_by_preferences(pref: PreferenceRequest):
    """Get recommendations based on user preferences."""
    try:
        recommender = get_recommender()
        
        # Convert Pydantic model to dict for processing
        def _to_native(val):
            if hasattr(val, 'dict'):
                return val.dict()
            return val
        
        preferences = _to_native(pref)
        results = recommender.recommend_by_preferences(preferences)
        
        return {
            "preferences": preferences,
            "recommendations": results,
            "count": len(results)
        }
    except Exception as e:
        return {"error": f"Error generating preference-based recommendations: {str(e)}"}, 500

@app.get("/sentiment")
def sentiment_score(text: str):
    """Analyze sentiment of given text."""
    try:
        from sentiment_analysis import analyze_sentiment
        sentiment = analyze_sentiment(text)
        return {
            "text": text,
            "sentiment": sentiment
        }
    except Exception as e:
        return {"error": f"Error analyzing sentiment: {str(e)}"}, 500

# Handler for Vercel serverless functions
handler = Mangum(app) 