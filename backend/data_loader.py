import pandas as pd
import numpy as np
from typing import Optional, Dict, Any
import os


class BookDataLoader:
    """Handles loading and basic preprocessing of the books dataset."""
    
    def __init__(self, csv_path: str = "books.csv"):
        self.csv_path = csv_path
        self.data: Optional[pd.DataFrame] = None
        self.processed_data: Optional[pd.DataFrame] = None
    
    def load_data(self) -> pd.DataFrame:
        """Load the books CSV file."""
        if not os.path.exists(self.csv_path):
            raise FileNotFoundError(f"Books CSV file not found: {self.csv_path}")
        
        try:
            self.data = pd.read_csv(self.csv_path, on_bad_lines='skip')
            
            # Fix column names by stripping whitespace
            self.data.columns = self.data.columns.str.strip()
            
            print(f"Loaded {len(self.data)} books from {self.csv_path}")
            print(f"Columns: {list(self.data.columns)}")
            return self.data
        except Exception as e:
            raise Exception(f"Error loading CSV file: {str(e)}")
    
    def preprocess_data(self) -> pd.DataFrame:
        """Basic preprocessing of the book data."""
        if self.data is None:
            raise ValueError("Data not loaded. Call load_data() first.")
        
        # Create a copy for processing
        self.processed_data = self.data.copy()
        
        # Extract primary author (first author before '/')
        self.processed_data['primary_author'] = (
            self.processed_data['authors']
            .apply(lambda x: self._extract_primary_author(x))
        )
        
        # Create rating categories
        self.processed_data['rating_category'] = (
            self.processed_data['average_rating']
            .apply(self._categorize_rating)
        )
        
        # Clean and validate numeric columns
        numeric_columns = ['average_rating', 'ratings_count', 'num_pages']
        for col in numeric_columns:
            self.processed_data[col] = pd.to_numeric(
                self.processed_data[col], errors='coerce'
            )
        
        # Fill missing values
        self.processed_data['language_code'] = (
            self.processed_data['language_code'].fillna('eng')
        )
        self.processed_data['num_pages'] = (
            self.processed_data['num_pages'].fillna(
                self.processed_data['num_pages'].median()
            )
        )
        
        print(f"Preprocessed data shape: {self.processed_data.shape}")
        return self.processed_data
    
    def get_books_by_genre(self, genre: str) -> pd.DataFrame:
        """Filter books by genre (searches in title for now)."""
        if self.processed_data is None:
            raise ValueError("Data not preprocessed. Call preprocess_data() first.")
        
        # Simple genre matching - can be enhanced with proper genre classification
        genre_lower = genre.lower()
        mask = (
            self.processed_data['title'].str.lower().str.contains(genre_lower, na=False) |
            self.processed_data['authors'].str.lower().str.contains(genre_lower, na=False)
        )
        
        filtered_books = self.processed_data[mask]
        print(f"Found {len(filtered_books)} books matching genre '{genre}'")
        return filtered_books
    
    def get_popular_books(self, min_ratings: int = 1000, top_n: int = 100) -> pd.DataFrame:
        """Get popular books with minimum rating count."""
        if self.processed_data is None:
            raise ValueError("Data not preprocessed. Call preprocess_data() first.")
        
        popular = self.processed_data[
            self.processed_data['ratings_count'] >= min_ratings
        ].sort_values('average_rating', ascending=False).head(top_n)
        
        return popular
    
    def _extract_primary_author(self, authors_str: str) -> str:
        """Extract the primary author from authors string."""
        if pd.isna(authors_str):
            return "Unknown"
        
        # Split by '/' and take the first author
        return authors_str.split('/')[0].strip()
    
    def _categorize_rating(self, rating: float) -> str:
        """Categorize rating into ranges."""
        if pd.isna(rating):
            return "unknown"
        elif rating <= 1:
            return "very_low"
        elif rating <= 2:
            return "low"
        elif rating <= 3:
            return "medium"
        elif rating <= 4:
            return "high"
        else:
            return "very_high"
    
    def get_data_info(self) -> Dict[str, Any]:
        """Get basic information about the dataset."""
        if self.processed_data is None:
            return {"error": "Data not loaded"}
        
        return {
            "total_books": len(self.processed_data),
            "unique_authors": self.processed_data['primary_author'].nunique(),
            "languages": self.processed_data['language_code'].value_counts().to_dict(),
            "rating_distribution": self.processed_data['rating_category'].value_counts().to_dict(),
            "avg_rating_range": {
                "min": self.processed_data['average_rating'].min(),
                "max": self.processed_data['average_rating'].max(),
                "mean": self.processed_data['average_rating'].mean()
            }
        }


def load_and_preprocess_books(csv_path: str = "books.csv") -> pd.DataFrame:
    """Convenience function to load and preprocess books data."""
    loader = BookDataLoader(csv_path)
    loader.load_data()
    return loader.preprocess_data()


if __name__ == "__main__":
    # Test the data loader
    loader = BookDataLoader()
    data = loader.load_data()
    processed = loader.preprocess_data()
    info = loader.get_data_info()
    print("Dataset info:", info) 