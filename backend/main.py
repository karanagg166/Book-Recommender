from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

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

@app.get("/books/similar")
def get_similar_books(title: str = Query(..., description="Book title to find similar books for"),
                     limit: int = Query(5, description="Number of similar books to return")):
    """Get books similar to a given book title."""
    try:
        recommender = get_recommender()
        # Access the recommendation engine directly for book-to-book recommendations
        similar_books = recommender.engine.get_book_recommendations_by_title(title, limit)
        return {
            "query_book": title,
            "similar_books": similar_books,
            "count": len(similar_books)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error finding similar books: {str(e)}")

@app.get("/books/popular")
def get_popular_books(
    rating_category: str | None = Query(None, description="Rating category filter, e.g. 'very_high', 'high', 'medium'"),
    language: str | None = Query(None, description="ISO language code filter, e.g. 'eng'") ,
    min_ratings: int = Query(1000, ge=0, description="Minimum ratings count to consider a book popular"),
    limit: int = Query(10, gt=0, description="Number of books to return")
):
    """Fetch popular books based on rating category, language, and popularity criteria."""
    try:
        recommender = get_recommender()
        popular_books = recommender.engine.get_popular_books_by_category(
            rating_category=rating_category,
            language=language,
            min_ratings=min_ratings,
            n_books=limit,
        )
        return {
            "rating_category": rating_category,
            "language": language,
            "min_ratings": min_ratings,
            "books": popular_books,
            "count": len(popular_books),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching popular books: {str(e)}")

@app.get("/analytics")
def get_analytics():
    """Return high-level collection statistics used by the frontend analytics dashboard."""
    try:
        recommender = get_recommender()
        df = recommender.engine.books_data  # pandas DataFrame

        if df is None or df.empty:
            raise ValueError("Books data not available. Try rebuilding the model.")

        import numpy as np
        import pandas as pd

        # Basic counts
        total_books: int = int(len(df))
        total_authors: int = int(df['primary_author'].nunique())
        avg_rating: float = float(df['average_rating'].mean()) if 'average_rating' in df else 0.0
        total_ratings: int = int(df['ratings_count'].sum()) if 'ratings_count' in df else 0

        # ---------- Genre distribution ----------
        # For performance, classify using simple keyword matching once.
        genre_counts: dict[str, int] = {g: 0 for g in recommender.genre_keywords}

        lower_titles = df['title'].str.lower().fillna("")
        lower_authors = df['authors'].str.lower().fillna("") if 'authors' in df else pd.Series("")

        import re
        for genre, keywords in recommender.genre_keywords.items():
            # Safely escape each keyword to avoid regex metacharacters interfering
            pattern = '|'.join(re.escape(k) for k in keywords)
            mask = lower_titles.str.contains(pattern, regex=True) | lower_authors.str.contains(pattern, regex=True)
            genre_counts[genre] = int(mask.sum())

        # Convert to list sorted by count desc
        genre_distribution = [
            {
                "name": g.replace('_', ' ').title(),
                "count": c,
                "percentage": round(c / total_books * 100, 1) if total_books else 0.0,
            }
            for g, c in sorted(genre_counts.items(), key=lambda x: x[1], reverse=True) if c > 0
        ]

        # ---------- Language distribution ----------
        top_lang_series = df['language_code'].fillna('unk').str.lower()
        lang_counts = top_lang_series.value_counts()
        top_languages = []
        for lang, cnt in lang_counts.head(5).items():
            top_languages.append({
                "language": lang,
                "count": int(cnt),
                "percentage": round(cnt / total_books * 100, 1) if total_books else 0.0,
            })

        # ---------- Rating distribution ----------
        bins = [0, 3.0, 3.5, 4.0, 4.5, 5.0]
        labels = [
            "Below 3.0",
            "3.0-3.5",
            "3.5-4.0",
            "4.0-4.5",
            "4.5-5.0",
        ]
        df['rating_bin'] = pd.cut(df['average_rating'], bins=bins, labels=labels, include_lowest=True, right=False)
        rating_counts = df['rating_bin'].value_counts().reindex(labels, fill_value=0)
        rating_distribution = [
            {
                "range": rng,
                "count": int(cnt),
                "percentage": round(cnt / total_books * 100, 1) if total_books else 0.0,
            }
            for rng, cnt in rating_counts.items()
        ]

        return {
            "total_books": total_books,
            "total_authors": total_authors,
            "avg_rating": round(avg_rating, 2),
            "total_ratings": total_ratings,
            "genre_distribution": genre_distribution,
            "top_languages": top_languages,
            "rating_distribution": rating_distribution,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing analytics: {str(e)}")


class PreferenceRequest(BaseModel):
    high_rating: bool | None = None  # Prefer books rated 4.0+
    popular: bool | None = None      # Prefer books with many ratings
    language: str | None = None      # ISO language code preference
    sentiment_positive: bool | None = None  # Prefer books with positive sentiment


@app.post("/recommend/preferences")
def recommend_by_preferences(pref: PreferenceRequest):
    """Return book recommendations tailored to user preference flags."""
    try:
        recommender = get_recommender()
        prefs_dict = {k: v for k, v in pref.dict().items() if v is not None}
        import numpy as np
        raw_recs = recommender.engine.get_books_similar_to_preferences(prefs_dict, n_recommendations=10)

        # Convert numpy types to native Python types for JSON serialization
        def _to_native(val):
            if isinstance(val, (np.integer,)):
                return int(val)
            if isinstance(val, (np.floating,)):
                return float(val)
            return val

        recs = [{k: _to_native(v) for k, v in rec.items()} for rec in raw_recs]

        return {
            "preferences": prefs_dict,
            "recommendations": recs,
            "count": len(recs),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating preference-based recommendations: {str(e)}")

@app.get("/sentiment")
def sentiment_score(text: str = Query(..., description="Text to evaluate sentiment for")):
    """Return sentiment classification and score for a piece of text (0-1 positive)."""
    try:
        recommender = get_recommender()
        analyzer = recommender.engine.sentiment_analyzer
        if analyzer is None:
            from sentiment_analysis import SentimentAnalyzer
            analyzer = SentimentAnalyzer()
            analyzer.load_model()
        sentiment, confidence = analyzer.predict_sentiment(text)
        score = analyzer.get_sentiment_score(text)
        return {
            "text": text,
            "sentiment": sentiment,
            "confidence": round(float(confidence), 3),
            "score": round(float(score), 3)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error computing sentiment: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
