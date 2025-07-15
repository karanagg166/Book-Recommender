import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Tuple, Optional
import joblib
import os

from data_loader import BookDataLoader
from feature_engineering import BookFeatureEngineering
from sentiment_analysis import SentimentAnalyzer
from simple_sentiment import SimpleSentimentAnalyzer


class BookRecommendationEngine:
    """Main recommendation engine using KNN and content-based filtering."""
    
    def __init__(self, model_path: str = "recommendation_model.pkl"):
        self.model_path = model_path
        self.data_loader = BookDataLoader()
        self.feature_engineer = BookFeatureEngineering()
        
        # Try to use advanced sentiment analyzer, fallback to simple one
        try:
            self.sentiment_analyzer = SentimentAnalyzer()
        except Exception as e:
            print(f"Failed to load advanced sentiment analyzer, using simple fallback: {e}")
            self.sentiment_analyzer = SimpleSentimentAnalyzer()
        
        # Model components
        self.knn_model: Optional[NearestNeighbors] = None
        self.books_data: Optional[pd.DataFrame] = None
        self.features_matrix: Optional[np.ndarray] = None
        self.feature_names: Optional[List[str]] = None
        
        # Recommendation parameters
        self.n_neighbors = 10
        self.min_similarity_threshold = 0.1
        
    def prepare_data(self):
        """Load and prepare all data for recommendations."""
        print("Loading and preprocessing book data...")
        
        # Load book data
        self.books_data = self.data_loader.load_data()
        self.books_data = self.data_loader.preprocess_data()
        
        # Generate sample reviews for sentiment analysis
        sample_reviews = self._generate_sample_reviews()
        self.books_data['review_text'] = sample_reviews
        
        # Add sentiment scores
        print("Computing sentiment scores...")
        try:
            self.books_data['sentiment_score'] = (
                self.sentiment_analyzer.batch_sentiment_scores(sample_reviews)
            )
        except Exception as e:
            print(f"Error computing sentiment scores, using neutral values: {e}")
            self.books_data['sentiment_score'] = [0.5] * len(self.books_data)
        
        # Engineer features
        print("Engineering features...")
        features_df = self.feature_engineer.engineer_all_features(self.books_data)
        
        # Add sentiment score to features
        features_df['sentiment_score'] = self.books_data['sentiment_score']
        
        # Scale features
        self.features_matrix = self.feature_engineer.scale_features(features_df)
        self.feature_names = list(features_df.columns)
        
        print(f"Prepared {len(self.books_data)} books with {len(self.feature_names)} features")
    
    def _generate_sample_reviews(self) -> List[str]:
        """Generate sample reviews for books (placeholder for real reviews)."""
        positive_reviews = [
            "Amazing book with great characters and plot!",
            "Couldn't put it down, highly recommend!",
            "Beautiful writing and engaging story.",
            "One of the best books I've ever read.",
            "Fantastic storytelling and character development.",
            "A masterpiece that everyone should read.",
            "Brilliant and thought-provoking narrative.",
            "Exceptional book with perfect pacing.",
        ]
        
        negative_reviews = [
            "Disappointing story with weak characters.",
            "Too slow and boring, couldn't finish it.",
            "Poor writing and unengaging plot.",
            "Not worth the time or money.",
            "Confusing storyline and flat characters.",
            "Expected much more from this book.",
            "Poorly executed with many plot holes.",
            "Waste of time, very disappointing.",
        ]
        
        neutral_reviews = [
            "Decent book, nothing special but okay.",
            "Average story with some good moments.",
            "It was fine, had its ups and downs.",
            "Not bad but not great either.",
            "Readable but forgettable.",
            "Good enough for a casual read.",
        ]
        
        all_reviews = positive_reviews + negative_reviews + neutral_reviews
        
        # Generate reviews based on book ratings
        reviews = []
        for _, book in self.books_data.iterrows():
            rating = book['average_rating']
            if rating >= 4.0:
                review = np.random.choice(positive_reviews)
            elif rating <= 2.5:
                review = np.random.choice(negative_reviews)
            else:
                review = np.random.choice(neutral_reviews)
            reviews.append(review)
        
        return reviews
    
    def train_model(self, algorithm: str = 'ball_tree'):
        """Train the KNN model for recommendations."""
        if self.features_matrix is None:
            raise ValueError("Data not prepared. Call prepare_data() first.")
        
        print(f"Training KNN model with {self.n_neighbors} neighbors...")
        self.knn_model = NearestNeighbors(
            n_neighbors=min(self.n_neighbors, len(self.books_data)),
            algorithm=algorithm,
            metric='cosine'
        )
        
        self.knn_model.fit(self.features_matrix)
        print("Model training completed!")
    
    def save_model(self):
        """Save the trained model and associated data."""
        model_data = {
            'knn_model': self.knn_model,
            'books_data': self.books_data,
            'features_matrix': self.features_matrix,
            'feature_names': self.feature_names,
            'feature_engineer': self.feature_engineer
        }
        
        joblib.dump(model_data, self.model_path)
        print(f"Model saved to {self.model_path}")
    
    def load_model(self) -> bool:
        """Load a pre-trained model."""
        try:
            if os.path.exists(self.model_path):
                model_data = joblib.load(self.model_path)
                
                self.knn_model = model_data['knn_model']
                self.books_data = model_data['books_data']
                self.features_matrix = model_data['features_matrix']
                self.feature_names = model_data['feature_names']
                self.feature_engineer = model_data['feature_engineer']
                
                print("Model loaded successfully!")
                return True
            else:
                print("No saved model found. Training new model...")
                self._initialize_new_model()
                return True
        except Exception as e:
            print(f"Error loading model: {e}")
            print("Falling back to training new model...")
            try:
                self._initialize_new_model()
                return True
            except Exception as train_error:
                print(f"Error training new model: {train_error}")
                return False
    
    def _initialize_new_model(self):
        """Initialize and train a new model."""
        try:
            self.prepare_data()
            self.train_model()
            self.save_model()
            print("New model trained and saved successfully!")
        except Exception as e:
            print(f"Error during model initialization: {e}")
            # Fall back to basic functionality without advanced features
            self._initialize_basic_model()
    
    def _initialize_basic_model(self):
        """Initialize basic model without advanced features."""
        print("Initializing basic model...")
        self.books_data = self.data_loader.load_data()
        self.books_data = self.data_loader.preprocess_data()
        
        # Create simple features
        simple_features = self.books_data[['average_rating', 'ratings_count']].fillna(0)
        self.features_matrix = self.feature_engineer.scaler.fit_transform(simple_features)
        self.feature_names = ['average_rating', 'ratings_count']
        
        # Train simple KNN model
        self.knn_model = NearestNeighbors(n_neighbors=6, algorithm='ball_tree', metric='euclidean')
        self.knn_model.fit(self.features_matrix)
        
        print("Basic model initialized successfully!")
    
    def get_book_recommendations_by_title(self, book_title: str, 
                                        n_recommendations: int = 5) -> List[Dict]:
        """Get recommendations based on a specific book title."""
        try:
            if self.knn_model is None or self.books_data is None:
                return [{"error": "Recommendation model not available"}]
            
            # Find the book
            book_matches = self.books_data[
                self.books_data['title'].str.lower().str.contains(
                    book_title.lower(), na=False
                )
            ]
            
            if book_matches.empty:
                return [{"error": f"Book '{book_title}' not found"}]
            
            # Use the first match
            book_idx = book_matches.index[0]
            book_features = self.features_matrix[book_idx].reshape(1, -1)
            
            # Get similar books
            distances, indices = self.knn_model.kneighbors(
                book_features, n_neighbors=min(n_recommendations + 1, len(self.books_data))
            )
            
            recommendations = []
            for i, (dist, idx) in enumerate(zip(distances[0], indices[0])):
                if idx == book_idx:  # Skip the input book itself
                    continue
                    
                book = self.books_data.iloc[idx]
                similarity = 1 - dist  # Convert distance to similarity
                
                recommendations.append({
                    'title': book['title'],
                    'author': book.get('primary_author', book.get('authors', 'Unknown')),
                    'rating': book['average_rating'],
                    'similarity': round(similarity, 3),
                    'ratings_count': book['ratings_count']
                })
                
                if len(recommendations) >= n_recommendations:
                    break
            
            return recommendations
        except Exception as e:
            print(f"Error getting book recommendations: {e}")
            return [{"error": "Error generating recommendations"}]
    
    def get_recommendations_by_features(self, target_features: Dict[str, float],
                                      n_recommendations: int = 5) -> List[Dict]:
        """Get recommendations based on feature preferences."""
        if self.knn_model is None:
            raise ValueError("Model not trained. Call train_model() first.")
        
        # Create feature vector from preferences
        feature_vector = np.zeros(len(self.feature_names))
        
        for feature_name, value in target_features.items():
            if feature_name in self.feature_names:
                idx = self.feature_names.index(feature_name)
                feature_vector[idx] = value
        
        # Normalize the feature vector
        feature_vector = feature_vector.reshape(1, -1)
        
        # Get recommendations
        distances, indices = self.knn_model.kneighbors(
            feature_vector, n_neighbors=n_recommendations
        )
        
        recommendations = []
        for dist, idx in zip(distances[0], indices[0]):
            book = self.books_data.iloc[idx]
            similarity = 1 - dist
            
            recommendations.append({
                'title': book['title'],
                'author': book['primary_author'],
                'rating': book['average_rating'],
                'similarity': round(similarity, 3),
                'ratings_count': book['ratings_count']
            })
        
        return recommendations
    
    def get_popular_books_by_category(self, rating_category: str = None,
                                    language: str = None,
                                    min_ratings: int = 1000,
                                    n_books: int = 10) -> List[Dict]:
        """Get popular books filtered by category and language."""
        if self.books_data is None:
            raise ValueError("Data not loaded. Call prepare_data() first.")
        
        # Filter data
        filtered_books = self.books_data.copy()
        
        if rating_category:
            filtered_books = filtered_books[
                filtered_books['rating_category'] == rating_category
            ]
        
        if language:
            filtered_books = filtered_books[
                filtered_books['language_code'] == language
            ]
        
        # Filter by minimum ratings and sort
        popular_books = filtered_books[
            filtered_books['ratings_count'] >= min_ratings
        ].sort_values('average_rating', ascending=False).head(n_books)
        
        recommendations = []
        for _, book in popular_books.iterrows():
            recommendations.append({
                'title': book['title'],
                'author': book['primary_author'],
                'rating': book['average_rating'],
                'ratings_count': book['ratings_count'],
                'language': book['language_code']
            })
        
        return recommendations
    
    def get_books_similar_to_preferences(self, preferences: Dict,
                                       n_recommendations: int = 5) -> List[Dict]:
        """Get books based on user preferences."""
        target_features = {}
        
        # Map preferences to features
        if 'high_rating' in preferences and preferences['high_rating']:
            target_features['rating_high'] = 1.0
            target_features['rating_very_high'] = 1.0
        
        if 'popular' in preferences and preferences['popular']:
            target_features['ratings_percentile'] = 0.9
        
        if 'language' in preferences:
            lang = preferences['language']
            target_features[f'lang_{lang}'] = 1.0
        
        if 'sentiment_positive' in preferences and preferences['sentiment_positive']:
            target_features['sentiment_score'] = 0.8
        
        return self.get_recommendations_by_features(target_features, n_recommendations)


def create_recommendation_engine() -> BookRecommendationEngine:
    """Factory function to create and initialize recommendation engine."""
    engine = BookRecommendationEngine()
    engine.load_model()
    return engine


if __name__ == "__main__":
    # Test the recommendation engine
    engine = BookRecommendationEngine()
    
    # Prepare data and train
    engine.prepare_data()
    engine.train_model()
    
    # Test book-based recommendations
    recommendations = engine.get_book_recommendations_by_title("Harry Potter")
    print("Recommendations for Harry Potter:")
    for rec in recommendations:
        print(f"- {rec['title']} by {rec['author']} (similarity: {rec['similarity']})")
    
    print("\nPopular high-rated books:")
    popular = engine.get_popular_books_by_category(rating_category='very_high')
    for book in popular:
        print(f"- {book['title']} by {book['author']} (rating: {book['rating']})") 