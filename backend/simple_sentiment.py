"""
Simple sentiment analyzer that doesn't require NLTK
Fallback option for when NLTK fails to download properly
"""

import re
from typing import List


class SimpleSentimentAnalyzer:
    """Simple rule-based sentiment analyzer."""
    
    def __init__(self):
        self.positive_words = {
            'amazing', 'awesome', 'brilliant', 'excellent', 'fantastic', 'great', 'incredible', 
            'outstanding', 'perfect', 'superb', 'wonderful', 'best', 'love', 'loved', 'beautiful',
            'good', 'nice', 'recommend', 'enjoy', 'enjoyed', 'engaging', 'captivating', 'compelling',
            'masterpiece', 'stunning', 'remarkable', 'impressive', 'delightful', 'charming'
        }
        
        self.negative_words = {
            'awful', 'terrible', 'horrible', 'bad', 'worst', 'hate', 'hated', 'boring', 'dull',
            'disappointing', 'waste', 'poor', 'weak', 'confusing', 'slow', 'predictable', 'cliche',
            'annoying', 'frustrating', 'ridiculous', 'stupid', 'pointless', 'uninteresting', 'bland'
        }
    
    def _clean_text(self, text: str) -> str:
        """Clean text for analysis."""
        if not text:
            return ""
        
        # Convert to lowercase and remove special characters
        text = re.sub(r'[^a-zA-Z\s]', ' ', str(text).lower())
        # Remove extra whitespace
        text = ' '.join(text.split())
        return text
    
    def get_sentiment_score(self, text: str) -> float:
        """Get sentiment score (0-1, where 1 is most positive)."""
        try:
            if not text:
                return 0.5
            
            clean_text = self._clean_text(text)
            words = clean_text.split()
            
            if not words:
                return 0.5
            
            positive_count = sum(1 for word in words if word in self.positive_words)
            negative_count = sum(1 for word in words if word in self.negative_words)
            
            # Calculate sentiment score
            total_sentiment_words = positive_count + negative_count
            
            if total_sentiment_words == 0:
                return 0.5  # Neutral if no sentiment words found
            
            # Score based on positive ratio, adjusted for text length
            positive_ratio = positive_count / total_sentiment_words
            
            # Boost score slightly if there are many positive words relative to text length
            word_density = total_sentiment_words / len(words)
            boost = min(0.1, word_density * 0.2)
            
            if positive_ratio > 0.5:
                score = 0.5 + (positive_ratio - 0.5) + boost
            else:
                score = 0.5 - (0.5 - positive_ratio) - boost
            
            # Ensure score is between 0 and 1
            return max(0.0, min(1.0, score))
            
        except Exception:
            return 0.5  # Return neutral on any error
    
    def batch_sentiment_scores(self, texts: List[str]) -> List[float]:
        """Get sentiment scores for multiple texts."""
        return [self.get_sentiment_score(text) for text in texts]
    
    def predict_sentiment(self, text: str) -> tuple:
        """Predict sentiment label and confidence."""
        score = self.get_sentiment_score(text)
        
        if score > 0.6:
            return 'positive', score
        elif score < 0.4:
            return 'negative', 1 - score
        else:
            return 'neutral', 0.5


def create_simple_sentiment_analyzer():
    """Create a simple sentiment analyzer instance."""
    return SimpleSentimentAnalyzer()


if __name__ == "__main__":
    # Test the simple sentiment analyzer
    analyzer = SimpleSentimentAnalyzer()
    
    test_texts = [
        "This book is absolutely amazing and I loved every page!",
        "Terrible story, boring characters, waste of money.",
        "It was okay, nothing special but not bad either.",
        "Outstanding masterpiece with brilliant characters!",
        "Awful and disappointing, worst book ever."
    ]
    
    for text in test_texts:
        score = analyzer.get_sentiment_score(text)
        sentiment, confidence = analyzer.predict_sentiment(text)
        print(f"Text: {text}")
        print(f"Score: {score:.3f}, Sentiment: {sentiment}, Confidence: {confidence:.3f}\n") 