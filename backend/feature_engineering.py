import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from typing import Tuple, Optional
import warnings
warnings.filterwarnings('ignore')


class BookFeatureEngineering:
    """Handles feature engineering for book recommendations."""
    
    def __init__(self):
        self.scaler = MinMaxScaler()
        self.rating_categories = [
            'very_low', 'low', 'medium', 'high', 'very_high'
        ]
        self.common_languages = [
            'eng', 'en-US', 'en-GB', 'en-CA', 'spa', 'fre', 'ger'
        ]
    
    def create_rating_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create one-hot encoded features for rating categories."""
        rating_features = pd.DataFrame()
        
        # Create binary features for each rating category
        for category in self.rating_categories:
            rating_features[f'rating_{category}'] = (
                data['rating_category'] == category
            ).astype(int)
        
        return rating_features
    
    def create_language_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create one-hot encoded features for languages."""
        language_features = pd.DataFrame()
        
        # Create binary features for common languages
        for lang in self.common_languages:
            language_features[f'lang_{lang}'] = (
                data['language_code'] == lang
            ).astype(int)
        
        # Add 'other' language category
        language_features['lang_other'] = (
            ~data['language_code'].isin(self.common_languages)
        ).astype(int)
        
        return language_features
    
    def create_popularity_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create features based on book popularity metrics."""
        popularity_features = pd.DataFrame()
        
        # Normalize ratings count (log scale to handle wide range)
        popularity_features['log_ratings_count'] = np.log1p(data['ratings_count'])
        
        # Rating quality score (combination of rating and count)
        popularity_features['rating_score'] = (
            data['average_rating'] * np.log1p(data['ratings_count'])
        )
        
        # Popularity percentiles
        popularity_features['ratings_percentile'] = (
            data['ratings_count'].rank(pct=True)
        )
        
        return popularity_features
    
    def create_content_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create features based on book content."""
        content_features = pd.DataFrame()
        
        # Ensure num_pages column exists and handle missing values
        if 'num_pages' not in data.columns:
            print("Warning: num_pages column not found, using default values")
            data['num_pages'] = 300  # Default page count
        
        # Fill missing page counts
        data['num_pages'] = data['num_pages'].fillna(data['num_pages'].median())
        
        # Page count features
        content_features['num_pages_normalized'] = np.log1p(data['num_pages'])
        
        # Page length categories
        page_bins = [0, 200, 400, 600, float('inf')]
        page_labels = ['short', 'medium', 'long', 'very_long']
        
        try:
            data['page_category'] = pd.cut(
                data['num_pages'], 
                bins=page_bins, 
                labels=page_labels,
                include_lowest=True
            )
        except Exception as e:
            print(f"Error creating page categories: {e}")
            # Fallback: create default categories
            data['page_category'] = 'medium'
        
        # One-hot encode page categories
        for category in page_labels:
            content_features[f'pages_{category}'] = (
                data['page_category'] == category
            ).astype(int)
        
        return content_features
    
    def create_author_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create features based on author information."""
        author_features = pd.DataFrame()
        
        # Author popularity (books count and average rating)
        author_stats = data.groupby('primary_author').agg({
            'bookID': 'count',
            'average_rating': 'mean',
            'ratings_count': 'sum'
        }).rename(columns={
            'bookID': 'author_book_count',
            'average_rating': 'author_avg_rating',
            'ratings_count': 'author_total_ratings'
        })
        
        # Merge back to main data
        author_features = data[['primary_author']].merge(
            author_stats, 
            left_on='primary_author', 
            right_index=True, 
            how='left'
        )
        
        # Normalize author features
        author_features['author_popularity_score'] = (
            np.log1p(author_features['author_total_ratings']) * 
            author_features['author_avg_rating']
        )
        
        # Remove the author name column
        author_features = author_features.drop('primary_author', axis=1)
        
        return author_features
    
    def create_composite_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create composite features combining multiple aspects."""
        composite_features = pd.DataFrame()
        
        # Quality score (weighted rating)
        C = data['average_rating'].mean()
        m = data['ratings_count'].quantile(0.9)
        
        def weighted_rating(row):
            v = row['ratings_count']
            R = row['average_rating']
            return (v/(v+m) * R) + (m/(m+v) * C)
        
        composite_features['weighted_rating'] = data.apply(weighted_rating, axis=1)
        
        # Engagement score
        composite_features['engagement_score'] = (
            data['ratings_count'] / (data['num_pages'] + 1)
        )
        
        return composite_features
    
    def engineer_all_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """Create all engineered features for the dataset."""
        print("Engineering features...")
        
        # Create individual feature sets
        rating_features = self.create_rating_features(data)
        language_features = self.create_language_features(data)
        popularity_features = self.create_popularity_features(data)
        content_features = self.create_content_features(data)
        author_features = self.create_author_features(data)
        composite_features = self.create_composite_features(data)
        
        # Combine all features
        all_features = pd.concat([
            rating_features,
            language_features,
            popularity_features,
            content_features,
            author_features,
            composite_features,
            data[['average_rating', 'ratings_count']]  # Keep original features
        ], axis=1)
        
        # Handle any NaN values
        all_features = all_features.fillna(0)
        
        print(f"Created {all_features.shape[1]} features for {all_features.shape[0]} books")
        return all_features
    
    def scale_features(self, features: pd.DataFrame, fit: bool = True) -> np.ndarray:
        """Scale features using MinMax scaling."""
        if fit:
            scaled_features = self.scaler.fit_transform(features)
        else:
            scaled_features = self.scaler.transform(features)
        
        return scaled_features
    
    def prepare_features_for_model(self, data: pd.DataFrame) -> Tuple[np.ndarray, pd.DataFrame]:
        """Complete pipeline to prepare features for modeling."""
        # Engineer all features
        features_df = self.engineer_all_features(data)
        
        # Scale features
        scaled_features = self.scale_features(features_df)
        
        return scaled_features, features_df


def create_book_features(data: pd.DataFrame) -> Tuple[np.ndarray, pd.DataFrame]:
    """Convenience function to create and scale book features."""
    feature_engineer = BookFeatureEngineering()
    return feature_engineer.prepare_features_for_model(data)


if __name__ == "__main__":
    # Test feature engineering
    from data_loader import load_and_preprocess_books
    
    data = load_and_preprocess_books()
    feature_engineer = BookFeatureEngineering()
    features, feature_df = feature_engineer.prepare_features_for_model(data)
    
    print(f"Feature matrix shape: {features.shape}")
    print(f"Feature columns: {list(feature_df.columns)}") 