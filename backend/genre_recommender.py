import pandas as pd
import numpy as np
from typing import List, Dict, Optional
import re

from recommendation_engine import BookRecommendationEngine


class GenreBasedRecommender:
    """Main interface for genre-based book recommendations."""
    
    def __init__(self):
        self.engine = BookRecommendationEngine()
        self.genre_keywords = self._initialize_genre_keywords()
        self._is_initialized = False
    
    def _initialize_genre_keywords(self) -> Dict[str, List[str]]:
        """Define keywords for different genres."""
        return {
            'fantasy': [
                'fantasy', 'magic', 'dragon', 'wizard', 'magical', 'enchanted',
                'fairy', 'mythical', 'quest', 'prophecy', 'sword', 'sorcery',
                'hobbit', 'elf', 'dwarf', 'tolkien', 'potter', 'chronicles'
            ],
            'romance': [
                'romance', 'love', 'heart', 'passion', 'wedding', 'bride',
                'dating', 'relationship', 'romantic', 'affair', 'lover'
            ],
            'mystery': [
                'mystery', 'detective', 'crime', 'murder', 'investigation',
                'suspect', 'clue', 'police', 'thriller', 'suspense', 'noir'
            ],
            'science_fiction': [
                'science', 'fiction', 'space', 'future', 'robot', 'alien',
                'galaxy', 'planet', 'time', 'travel', 'cyberpunk', 'dystopian'
            ],
            'horror': [
                'horror', 'scary', 'ghost', 'haunted', 'vampire', 'zombie',
                'supernatural', 'evil', 'dark', 'terror', 'nightmare'
            ],
            'adventure': [
                'adventure', 'journey', 'exploration', 'expedition', 'survival',
                'treasure', 'island', 'wilderness', 'danger', 'action'
            ],
            'biography': [
                'biography', 'memoir', 'life', 'autobiography', 'story', 'born',
                'childhood', 'personal', 'history', 'true', 'real'
            ],
            'history': [
                'history', 'historical', 'war', 'ancient', 'medieval', 'century',
                'empire', 'revolution', 'battle', 'past', 'civilization'
            ],
            'philosophy': [
                'philosophy', 'philosophical', 'meaning', 'existence', 'truth',
                'wisdom', 'thought', 'consciousness', 'ethics', 'morality'
            ],
            'self_help': [
                'self', 'help', 'improvement', 'success', 'motivational',
                'productivity', 'habits', 'mindset', 'personal', 'development'
            ]
        }
    
    def initialize(self):
        """Initialize the recommendation engine."""
        if not self._is_initialized:
            print("Initializing genre-based recommender...")
            self.engine.load_model()
            self._is_initialized = True
            print("Recommender ready!")
        else:
            print("Recommender already initialized, skipping...")
    
    def _classify_genre(self, book_title: str, book_author: str = "") -> List[str]:
        """Classify a book into genres based on title and author."""
        text = f"{book_title} {book_author}".lower()
        matched_genres = []
        
        for genre, keywords in self.genre_keywords.items():
            for keyword in keywords:
                if keyword in text:
                    matched_genres.append(genre)
                    break
        
        return matched_genres if matched_genres else ['general']
    
    def _find_books_by_genre(self, genre: str, limit: int = 100) -> pd.DataFrame:
        """Find books that match the specified genre."""
        if not self._is_initialized:
            self.initialize()
        
        books_data = self.engine.books_data
        genre_lower = genre.lower()
        
        # Method 1: Direct keyword search in title
        title_matches = books_data[
            books_data['title'].str.lower().str.contains(
                '|'.join(self.genre_keywords.get(genre_lower, [genre_lower])),
                na=False, regex=True
            )
        ]
        
        # Method 2: Search in authors for genre-specific authors
        author_matches = books_data[
            books_data['authors'].str.lower().str.contains(
                '|'.join(self.genre_keywords.get(genre_lower, [genre_lower])),
                na=False, regex=True
            )
        ]
        
        # Combine and remove duplicates
        genre_books = pd.concat([title_matches, author_matches]).drop_duplicates()
        
        # If no matches found, try broader search
        if genre_books.empty:
            broad_search = books_data[
                books_data['title'].str.lower().str.contains(
                    genre_lower, na=False
                ) | books_data['authors'].str.lower().str.contains(
                    genre_lower, na=False
                )
            ]
            genre_books = broad_search
        
        # Sort by popularity and rating
        if not genre_books.empty:
            genre_books = genre_books.sort_values(
                ['average_rating', 'ratings_count'], 
                ascending=[False, False]
            )
        
        return genre_books.head(limit)
    
    def recommend_books_by_genre(self, genre: str, 
                                n_recommendations: int = 6,
                                min_rating: float = 3.5,
                                min_ratings_count: int = 100) -> List[str]:
        """
        Main function to recommend books by genre.
        Returns a list of book titles.
        """
        if not self._is_initialized:
            self.initialize()
        
        try:
            # Find books in the genre
            genre_books = self._find_books_by_genre(genre)
            
            if genre_books.empty:
                return [f"Sorry, no books found for genre '{genre}'. Try 'fantasy', 'romance', 'mystery', etc."]
            
            # Filter by quality criteria
            quality_books = genre_books[
                (genre_books['average_rating'] >= min_rating) &
                (genre_books['ratings_count'] >= min_ratings_count)
            ]
            
            # If no quality books, lower the standards
            if quality_books.empty:
                quality_books = genre_books[
                    genre_books['average_rating'] >= max(3.0, min_rating - 0.5)
                ]
            
            # If still empty, use all genre books
            if quality_books.empty:
                quality_books = genre_books
            
            # Get recommendations using content-based filtering
            recommendations = []
            
            # Method 1: Get popular books from the genre
            popular_books = quality_books.head(n_recommendations)
            
            for _, book in popular_books.iterrows():
                recommendations.append(book['title'])
            
            # Method 2: If we need more, use similarity-based recommendations
            if len(recommendations) < n_recommendations and len(quality_books) > 0:
                # Pick a representative book from the genre
                seed_book = quality_books.iloc[0]['title']
                
                try:
                    similar_books = self.engine.get_book_recommendations_by_title(
                        seed_book, n_recommendations * 2
                    )
                    
                    for book_rec in similar_books:
                        if 'title' in book_rec and book_rec['title'] not in recommendations:
                            recommendations.append(book_rec['title'])
                            if len(recommendations) >= n_recommendations:
                                break
                except Exception as e:
                    print(f"Error getting similar books: {e}")
            
            # Ensure we have enough recommendations
            if len(recommendations) < n_recommendations:
                # Add more books from the genre pool
                for _, book in quality_books.iterrows():
                    if book['title'] not in recommendations:
                        recommendations.append(book['title'])
                        if len(recommendations) >= n_recommendations:
                            break
            
            return recommendations[:n_recommendations] if recommendations else [
                f"Found books in '{genre}' but couldn't generate recommendations. Try another genre."
            ]
            
        except Exception as e:
            print(f"Error in recommend_books_by_genre: {e}")
            return [f"Error generating recommendations for '{genre}'. Please try again."]
    
    def get_available_genres(self) -> List[str]:
        """Get list of available genres."""
        return list(self.genre_keywords.keys())
    
    def get_genre_info(self, genre: str) -> Dict:
        """Get information about a specific genre."""
        if not self._is_initialized:
            self.initialize()
        
        genre_books = self._find_books_by_genre(genre)
        
        return {
            'genre': str(genre),
            'total_books': int(len(genre_books)),
            'avg_rating': float(genre_books['average_rating'].mean()) if not genre_books.empty else 0.0,
            'keywords': self.genre_keywords.get(genre.lower(), []),
            'sample_books': [str(title) for title in genre_books['title'].head(5).tolist()] if not genre_books.empty else []
        }
    
    def search_books(self, query: str, n_results: int = 10) -> List[Dict]:
        """Search for books by title or author."""
        if not self._is_initialized:
            self.initialize()
        
        books_data = self.engine.books_data
        query_lower = query.lower()
        
        # Search in titles and authors
        matches = books_data[
            books_data['title'].str.lower().str.contains(query_lower, na=False) |
            books_data['authors'].str.lower().str.contains(query_lower, na=False)
        ].sort_values(['average_rating', 'ratings_count'], ascending=[False, False])
        
        results = []
        for _, book in matches.head(n_results).iterrows():
            results.append({
                'title': str(book['title']),
                'author': str(book['primary_author']),
                'rating': float(book['average_rating']),
                'ratings_count': int(book['ratings_count'])
            })
        
        return results


# Global instance for the API
_recommender_instance = None


def get_recommender() -> GenreBasedRecommender:
    """Get the global recommender instance (singleton pattern)."""
    global _recommender_instance
    if _recommender_instance is None:
        _recommender_instance = GenreBasedRecommender()
        _recommender_instance.initialize()
    return _recommender_instance


def recommend_books(genre: str, n_recommendations: int = 6) -> List[str]:
    """
    Main function to be used by the API.
    Returns a list of book titles for the given genre.
    """
    recommender = get_recommender()
    return recommender.recommend_books_by_genre(genre, n_recommendations)


if __name__ == "__main__":
    # Test the genre recommender
    recommender = GenreBasedRecommender()
    recommender.initialize()
    
    # Test different genres
    test_genres = ['fantasy', 'romance', 'mystery', 'science_fiction']
    
    for genre in test_genres:
        print(f"\n--- {genre.upper()} RECOMMENDATIONS ---")
        recommendations = recommender.recommend_books_by_genre(genre)
        for i, book in enumerate(recommendations, 1):
            print(f"{i}. {book}")
    
    # Test genre info
    print(f"\nGenre info for 'fantasy':")
    info = recommender.get_genre_info('fantasy')
    print(info) 