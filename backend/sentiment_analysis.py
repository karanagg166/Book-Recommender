import pandas as pd
import numpy as np
import re
import joblib
import os
from typing import List, Optional, Tuple
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import nltk
from nltk import word_tokenize
from nltk.corpus import stopwords


class SentimentAnalyzer:
    """Handles sentiment analysis for book reviews."""
    
    def __init__(self, model_path: str = "sentiment_model.pkl", 
                 vectorizer_path: str = "sentiment_vectorizer.pkl"):
        self.model_path = model_path
        self.vectorizer_path = vectorizer_path
        self.model: Optional[LogisticRegression] = None
        self.vectorizer: Optional[CountVectorizer] = None
        self._download_nltk_dependencies()
        
    def _download_nltk_dependencies(self):
        """Download required NLTK data."""
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt', quiet=True)
        
        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            nltk.download('stopwords', quiet=True)
    
    def _clean_text(self, text: str) -> str:
        """Clean and preprocess text."""
        if pd.isna(text):
            return ""
        
        # Convert to lowercase
        text = str(text).lower()
        
        # Remove special characters, keep only alphanumeric and spaces
        text = re.sub('[^A-Za-z0-9 ]+', ' ', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        return text
    
    def generate_sample_reviews(self, num_positive: int = 50, num_negative: int = 50) -> pd.DataFrame:
        """Generate sample reviews for training (fallback if no training data)."""
        positive_reviews = [
            "An absolute page-turner with a beautiful cover design.",
            "The storyline was intriguing and held my interest till the end.",
            "Great for fans of mystery and thrillers, well worth the price.",
            "The character development was impressive and relatable.",
            "A quick and enjoyable read with a simple yet elegant cover.",
            "Engaging language that flows naturally, making it hard to put down.",
            "This book has quickly become a favorite addition to my collection.",
            "Unique plot with unexpected twists – highly recommend!",
            "Loved the author's writing style, very approachable.",
            "An excellent choice for weekend reading.",
            "Hard to put down once you start – captivating storyline!",
            "The cover design is eye-catching and really sets the tone.",
            "The pacing was spot-on, no dragging sections.",
            "An underrated book that deserves more recognition.",
            "The character arcs were well thought out and rewarding.",
            "Highly recommend for fans of classic fiction.",
            "Brilliant writing – the language pulls you in.",
            "A refreshing story that breaks away from clichés.",
            "Beautiful language, almost poetic in parts.",
            "A thoughtful and insightful narrative.",
            "Characters felt like real people, loved it!",
            "The story had me guessing till the very end.",
            "This book is a great escape – fully engrossing!",
            "The storyline flows seamlessly from start to finish.",
            "Engaging from the first page.",
            "Definitely worth adding to your collection.",
            "A beautiful blend of suspense and romance.",
            "The language feels effortless and natural.",
            "A touching and heartfelt tale.",
            "An emotional rollercoaster.",
            "Surprisingly deep for a short book.",
            "A great story with memorable characters.",
            "Kept me engaged from start to finish.",
            "Outstanding character development.",
            "Perfect for a quiet evening read.",
            "The plot was well-crafted and engaging.",
            "Amazing storytelling and beautiful prose.",
            "Could not put it down, absolutely captivating.",
            "The ending was satisfying and well-executed.",
            "Excellent pacing throughout the entire book.",
            "Rich descriptions and vivid imagery.",
            "The dialogue felt authentic and natural.",
            "A masterpiece of modern literature.",
            "Incredibly moving and powerful story.",
            "The themes were explored with great depth.",
            "Brilliant character interactions.",
            "The plot twists were expertly executed.",
            "A truly unforgettable reading experience.",
            "The author's voice is distinctive and compelling.",
            "Perfect balance of action and emotion."
        ]
        
        negative_reviews = [
            "The cover design was bland and didn't match the story.",
            "The storyline felt generic and lacked originality.",
            "The book is overpriced for the quality of content.",
            "Characters were flat and hard to connect with.",
            "A slow read with too many predictable moments.",
            "The writing style was overly complex and confusing.",
            "The cover was misleading about the book's content.",
            "The story didn't live up to the promising synopsis.",
            "The plot twists were obvious and didn't surprise me.",
            "The language felt too simplistic and unengaging.",
            "The book was much shorter than I expected for the price.",
            "Pacing was off, and the plot dragged in places.",
            "I found it difficult to relate to any of the characters.",
            "The storyline was confusing and hard to follow.",
            "Couldn't finish it – just didn't hold my interest.",
            "The story lacked depth and emotional engagement.",
            "The book's ending felt abrupt and unsatisfying.",
            "Not worth the price – a disappointing read.",
            "The language was overly simple, almost juvenile.",
            "The plot felt like a copy of several other books.",
            "Characters were one-dimensional and uninteresting.",
            "The cover design was the best part of the book.",
            "An okay read, but not something I'd recommend.",
            "The story felt forced and uninspired.",
            "Couldn't connect with the characters at all.",
            "Felt like a recycled plot with no new ideas.",
            "The language was stiff and hard to read.",
            "The book seemed rushed and lacked detail.",
            "Didn't live up to the author's previous works.",
            "Overall, a very forgettable read.",
            "The story had potential but was poorly executed.",
            "Not enough depth in the plot to keep me engaged.",
            "A disappointing read for the price.",
            "Characters felt unrealistic and underdeveloped.",
            "Expected more based on the reviews, but was let down.",
            "The book was too long for the story it had to tell.",
            "A poorly written story with a predictable ending.",
            "The plot twists felt forced and unnecessary.",
            "The language was dry and uninteresting.",
            "The pacing was uneven, and the story dragged.",
            "The book failed to hold my interest.",
            "Disappointing – I expected so much more.",
            "The author's writing style didn't appeal to me.",
            "Would not recommend to a friend.",
            "The story was all over the place with no direction.",
            "Boring and unimaginative plot.",
            "The characters lacked personality and depth.",
            "Too many clichés and predictable moments.",
            "The writing felt amateurish and unpolished.",
            "A waste of time and money."
        ]
        
        # Create training data
        reviews_data = []
        
        # Add positive reviews
        for review in positive_reviews[:num_positive]:
            reviews_data.append({'text': review, 'sentiment': 'positive'})
        
        # Add negative reviews  
        for review in negative_reviews[:num_negative]:
            reviews_data.append({'text': review, 'sentiment': 'negative'})
        
        return pd.DataFrame(reviews_data)
    
    def train_model(self, training_data: Optional[pd.DataFrame] = None, 
                   text_column: str = 'text', label_column: str = 'sentiment',
                   test_size: float = 0.2, save_model: bool = True) -> dict:
        """Train sentiment analysis model."""
        if training_data is None:
            print("No training data provided, using sample reviews...")
            training_data = self.generate_sample_reviews()
        
        # Clean text data
        training_data['clean_text'] = training_data[text_column].apply(self._clean_text)
        
        # Create vectorizer
        stop_words = stopwords.words('english')
        self.vectorizer = CountVectorizer(
            tokenizer=word_tokenize,
            stop_words=stop_words,
            ngram_range=(1, 2),
            max_features=5000
        )
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            training_data['clean_text'], 
            training_data[label_column],
            test_size=test_size, 
            random_state=42
        )
        
        # Vectorize text
        X_train_vec = self.vectorizer.fit_transform(X_train)
        X_test_vec = self.vectorizer.transform(X_test)
        
        # Train model
        self.model = LogisticRegression(max_iter=1000, random_state=42)
        self.model.fit(X_train_vec, y_train)
        
        # Evaluate
        train_pred = self.model.predict(X_train_vec)
        test_pred = self.model.predict(X_test_vec)
        
        results = {
            'train_accuracy': accuracy_score(y_train, train_pred),
            'test_accuracy': accuracy_score(y_test, test_pred),
            'num_features': X_train_vec.shape[1],
            'training_samples': len(training_data)
        }
        
        print(f"Model trained successfully!")
        print(f"Train accuracy: {results['train_accuracy']:.3f}")
        print(f"Test accuracy: {results['test_accuracy']:.3f}")
        
        if save_model:
            self.save_model()
        
        return results
    
    def load_model(self) -> bool:
        """Load trained model and vectorizer."""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.vectorizer_path):
                self.model = joblib.load(self.model_path)
                self.vectorizer = joblib.load(self.vectorizer_path)
                print("Sentiment model loaded successfully!")
                return True
            else:
                print("Model files not found. Training new model...")
                self.train_model()
                return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
    
    def save_model(self):
        """Save trained model and vectorizer."""
        if self.model is not None and self.vectorizer is not None:
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.vectorizer, self.vectorizer_path)
            print(f"Model saved to {self.model_path}")
    
    def predict_sentiment(self, text: str) -> Tuple[str, float]:
        """Predict sentiment for a single text."""
        if self.model is None or self.vectorizer is None:
            if not self.load_model():
                raise ValueError("Model not loaded and couldn't train new model")
        
        # Clean and vectorize text
        clean_text = self._clean_text(text)
        text_vec = self.vectorizer.transform([clean_text])
        
        # Get prediction and probability
        prediction = self.model.predict(text_vec)[0]
        probabilities = self.model.predict_proba(text_vec)[0]
        
        # Get confidence (max probability)
        confidence = max(probabilities)
        
        return prediction, confidence
    
    def get_sentiment_score(self, text: str) -> float:
        """Get sentiment score (0-1, where 1 is most positive)."""
        if self.model is None or self.vectorizer is None:
            if not self.load_model():
                raise ValueError("Model not loaded and couldn't train new model")
        
        # Clean and vectorize text
        clean_text = self._clean_text(text)
        text_vec = self.vectorizer.transform([clean_text])
        
        # Get probability of positive sentiment
        probabilities = self.model.predict_proba(text_vec)[0]
        
        # Return probability of positive class
        # Assuming classes are ['negative', 'positive'] in alphabetical order
        if len(probabilities) == 2:
            positive_prob = probabilities[1]  # Second class (positive)
        else:
            positive_prob = 0.5  # Default if something goes wrong
        
        return positive_prob
    
    def batch_sentiment_scores(self, texts: List[str]) -> List[float]:
        """Get sentiment scores for multiple texts."""
        return [self.get_sentiment_score(text) for text in texts]


def create_sentiment_analyzer() -> SentimentAnalyzer:
    """Factory function to create and initialize sentiment analyzer."""
    analyzer = SentimentAnalyzer()
    analyzer.load_model()
    return analyzer


if __name__ == "__main__":
    # Test sentiment analyzer
    analyzer = SentimentAnalyzer()
    
    # Train with sample data
    results = analyzer.train_model()
    print("Training results:", results)
    
    # Test predictions
    test_texts = [
        "This book is absolutely amazing and I loved every page!",
        "Terrible story, boring characters, waste of money.",
        "It was okay, nothing special but not bad either."
    ]
    
    for text in test_texts:
        sentiment, confidence = analyzer.predict_sentiment(text)
        score = analyzer.get_sentiment_score(text)
        print(f"Text: {text}")
        print(f"Sentiment: {sentiment} (confidence: {confidence:.3f})")
        print(f"Score: {score:.3f}\n") 