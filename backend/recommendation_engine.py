import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from typing import List, Dict, Optional
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
    
    def train_model(self, algorithm: str = 'auto'):
        """Train the KNN model for recommendations."""
        if self.features_matrix is None:
            raise ValueError("Data not prepared. Call prepare_data() first.")
        
        print(f"Training KNN model with {self.n_neighbors} neighbors...")
        # Use brute force for cosine similarity as it's the most reliable
        self.knn_model = NearestNeighbors(
            n_neighbors=min(self.n_neighbors, len(self.books_data)),
            algorithm='brute',  # brute force works with all metrics including cosine
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
            print(f"🔍 Looking for saved model at: {self.model_path}")
            if os.path.exists(self.model_path):
                print("📁 Found saved model, loading...")
                model_data = joblib.load(self.model_path)
                
                self.knn_model = model_data['knn_model']
                self.books_data = model_data['books_data']
                self.features_matrix = model_data['features_matrix']
                self.feature_names = model_data['feature_names']
                self.feature_engineer = model_data['feature_engineer']
                
                print("✅ Model loaded successfully!")
                return True
            else:
                print("❌ No saved model found. Training new model...")
                self._initialize_new_model()
                return True
        except Exception as e:
            print(f"⚠️  Error loading model: {e}")
            print("🔄 Falling back to training new model...")
            try:
                self._initialize_new_model()
                return True
            except Exception as train_error:
                print(f"❌ Error training new model: {train_error}")
                return False
    
    def _initialize_new_model(self):
        """Initialize and train a new model."""
        try:
            print("🔧 Preparing data for advanced model...")
            self.prepare_data()
            print("🎯 Training KNN model...")
            self.train_model()
            print("💾 Saving model...")
            self.save_model()
            print("✅ New advanced model trained and saved successfully!")
        except Exception as e:
            print(f"❌ Error during advanced model initialization: {e}")
            print("🔄 Falling back to basic model...")
            # Fall back to basic functionality without advanced features
            self._initialize_basic_model()
    
    def _initialize_basic_model(self):
        """Initialize basic model without advanced features."""
        print("🔨 Initializing basic model...")
        self.books_data = self.data_loader.load_data()
        self.books_data = self.data_loader.preprocess_data()
        
        # Create better features for similarity
        # Use multiple features that can indicate book similarity
        features_list = []
        feature_names = []
        
        # Rating features
        self.books_data['rating_normalized'] = self.books_data['average_rating'] / 5.0
        features_list.append(self.books_data['rating_normalized'].fillna(0))
        feature_names.append('rating_normalized')
        
        # Popularity feature (log-scaled)
        self.books_data['popularity'] = np.log1p(self.books_data['ratings_count']).fillna(0)
        max_popularity = self.books_data['popularity'].max()
        if max_popularity > 0:
            self.books_data['popularity_normalized'] = self.books_data['popularity'] / max_popularity
        else:
            self.books_data['popularity_normalized'] = 0
        features_list.append(self.books_data['popularity_normalized'])
        feature_names.append('popularity_normalized')
        
        # Language features (one-hot encoding for top languages)
        top_languages = self.books_data['language_code'].value_counts().head(5).index
        for lang in top_languages:
            lang_feature = (self.books_data['language_code'] == lang).astype(float)
            features_list.append(lang_feature)
            feature_names.append(f'lang_{lang}')
        
        # Publication year features (normalized)
        if 'publication_year' in self.books_data.columns:
            min_year = self.books_data['publication_year'].min()
            max_year = self.books_data['publication_year'].max()
            if max_year > min_year:
                year_normalized = (self.books_data['publication_year'] - min_year) / (max_year - min_year)
            else:
                year_normalized = pd.Series(0, index=self.books_data.index)
            features_list.append(year_normalized.fillna(0.5))
            feature_names.append('year_normalized')
        
        # Author frequency (books by same author are more similar)
        author_counts = self.books_data['primary_author'].value_counts()
        author_popularity = self.books_data['primary_author'].map(author_counts).fillna(1)
        author_normalized = np.log1p(author_popularity) / np.log1p(author_counts.max()) if author_counts.max() > 0 else pd.Series(0, index=self.books_data.index)
        features_list.append(author_normalized)
        feature_names.append('author_popularity')
        
        # Combine all features
        import pandas as pd
        features_df = pd.concat(features_list, axis=1)
        features_df.columns = feature_names
        
        # Fill any remaining NaN values
        features_df = features_df.fillna(0)
        
        print(f"📊 Created {len(feature_names)} features: {feature_names}")
        
        # Store features
        self.features_matrix = features_df.values
        self.feature_names = feature_names
        
        # Train KNN model with cosine similarity for better content matching
        print("🎯 Training basic KNN model with cosine similarity...")
        self.knn_model = NearestNeighbors(
            n_neighbors=min(6, len(self.books_data)), 
            algorithm='brute',  # Use brute force for cosine with small datasets
            metric='cosine'
        )
        self.knn_model.fit(self.features_matrix)
        
        print("✅ Basic model initialized successfully with improved features!")
        
        # Save the basic model so we don't need to retrain every time
        try:
            self.save_model()
            print("💾 Basic model saved successfully!")
        except Exception as e:
            print(f"⚠️  Warning: Could not save basic model: {e}")
    
    def ˀget_book_recommendations_by_title(self, book_title: str, 
                                        n_recommendations: int = 5) -> List[Dict]:
        """Get recommendations based on a specific book title."""
        try:
            if self.knn_model is None or self.books_data is None:
                return [{"error": "Recommendation model not available"}]
            
            # 1) Exact case-insensitive match
            exact_matches = self.books_data[self.books_data['title'].str.lower() == book_title.lower()]
            if not exact_matches.empty:
                book_idx = exact_matches.index[0]
            else:
                # 2) Safe substring contains (regex=False prevents special-char issues)
                contains_matches = self.books_data[
                    self.books_data['title'].str.lower().str.contains(book_title.lower(), regex=False, na=False)
                ]
                if not contains_matches.empty:
                    book_idx = contains_matches.index[0]
                else:
                    # 3) Fuzzy match – pick highest similarity title
                    from difflib import SequenceMatcher
                    titles_lower = self.books_data['title'].str.lower().tolist()
                    ratios = [SequenceMatcher(None, t, book_title.lower()).ratio() for t in titles_lower]
                    best_idx = int(np.argmax(ratios))
                    if ratios[best_idx] < 0.4:  # arbitrary threshold; no good match
                        return [{"error": f"Book '{book_title}' not found"}]
                    book_idx = best_idx
            
            book_features = self.features_matrix[book_idx].reshape(1, -1)
            
            print(f"Found book: {self.books_data.iloc[book_idx]['title']}")
            # Debug: print(f"Using {self.knn_model.metric} distance metric")
            
            # Get similar books
            distances, indices = self.knn_model.kneighbors(
                book_features, n_neighbors=min(n_recommendations + 1, len(self.books_data))
            )
            
            # Debug: print(f"Raw distances: {distances[0]}")
            
            recommendations = []
            for i, (dist, idx) in enumerate(zip(distances[0], indices[0])):
                if idx == book_idx:  # Skip the input book itself
                    continue
                    
                book = self.books_data.iloc[idx]
                
                # Calculate similarity based on the distance metric
                if self.knn_model.metric == 'cosine':
                    # Cosine distance is in [0, 2], convert to similarity [0, 1]
                    similarity = max(0, (2 - dist) / 2)
                elif self.knn_model.metric == 'euclidean':
                    # For euclidean, convert using exponential decay for better interpretation
                    similarity = max(0, 1 / (1 + dist))
                else:
                    # General case: assume distance is in [0, 1] or normalize
                    similarity = max(0, 1 - min(dist, 1))
                
                recommendations.append({
                    'title': str(book['title']),
                    'author': str(book.get('primary_author', book.get('authors', 'Unknown'))),
                    'rating': float(book['average_rating']),
                    'similarity': round(float(similarity), 3),
                    'ratings_count': int(book['ratings_count'])
                })
                
                if len(recommendations) >= n_recommendations:
                    break
            
            # Debug: print(f"Returning {len(recommendations)} recommendations")
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
                'title': str(book['title']),
                'author': str(book['primary_author']),
                'rating': float(book['average_rating']),
                'ratings_count': int(book['ratings_count']),
                'language': str(book['language_code'])
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