from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import uvicorn

# Import our modular recommendation system
from genre_recommender import recommend_books, get_recommender

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

@app.get("/")
def root():
    """Root endpoint with API information."""
    return {
        "message": "Book Recommender API",
        "version": "2.0.0",
        "endpoints": {
            "/recommend": "Get book recommendations by genre",
            "/genres": "List available genres",
            "/search": "Search for books by title or author"
        }
    }

@app.get("/recommend")
def get_recommendations(genre: str = Query(..., description="Genre to get recommendations for")):
    """Get book recommendations for a specific genre."""
    try:
        results = recommend_books(genre)
        return {
            "genre": genre,
            "recommendations": results,
            "count": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

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
        raise HTTPException(status_code=500, detail=f"Error fetching genres: {str(e)}")

@app.get("/genre/{genre}/info")
def get_genre_info(genre: str):
    """Get detailed information about a specific genre."""
    try:
        recommender = get_recommender()
        info = recommender.get_genre_info(genre)
        return info
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching genre info: {str(e)}")

@app.get("/search")
def search_books(q: str = Query(..., description="Search query for books")):
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
        raise HTTPException(status_code=500, detail=f"Error searching books: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
