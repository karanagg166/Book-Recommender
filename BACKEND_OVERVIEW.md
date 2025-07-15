# 📚 Book-Recommender Backend – Deep-Dive Documentation

*Version: 2.0.0 | Last updated: <!--DATE-->*

---

## 1. Executive Summary  
The backend is a **modular Python / FastAPI** service that transforms a raw Kaggle book dataset into a fully-fledged, AI-powered recommendation API.  
The pipeline:
1. **Ingests & cleans** 11 k+ books (title, author, language, ratings…)
2. **Generates 29+ numerical features** (ratings, popularity, language-one-hots, author popularity, publication era, sentiment, etc.)
3. **Trains a K-Nearest-Neighbours (KNN)** model (cosine similarity) to index every book in a multi-dimensional feature space.
4. **Exposes REST endpoints** for genre, search, and *book-to-book* similarity – all behind a single singleton recommender that persists its model to disk for ultra-fast startups.

> **Key value-prop**: zero external ML dependencies (no GPUs, no cloud services) yet strong content-based recommendations with explainable features.

---

## 2. High-Level Architecture
```
┌──────────────┐   load & clean   ┌──────────────────┐   engineer   ┌──────────────────┐
│  books.csv   │ ───────────────► │   Data Loader    │ ────────────► │  Feature Engine  │
└──────────────┘                  └──────────────────┘              │  (29+ features)  │
                                                                      └────────┬────────┘
                                                                               │  matrix (N×29)
                                                                      train    ▼
                                                                   ┌──────────────────┐
                                                                   │  KNN Model (sk) │
                                                                   └────────┬────────┘
                                                                               │  Nearest Neighbours
                                                   singleton        ┌──────────▼─────────┐
FastAPI  ◄────────  GenreRecommender  ◄──────────  BookRecommendationEngine   │
( REST )                 ▲                                            └──────────▲─────────┘
                         │ startup                                        load/save .pkl
                         └────────────  main.py  ───────────►  /recommend, /search, /books/similar
```

---

## 3. Module-by-Module Breakdown

### 3.1 `data_loader.py`
| Responsibility | Details |
|---|---|
| CSV ingestion | Reads `books.csv` ➜ 11 123 rows |
| Cleaning | • Strips whitespace<br>• Normalises column names<br>• Extracts **primary author** (first author in multi-author strings) |
| Derived columns | • `rating_category` buckets<br>• `publication_year` parsed from `publication_date` |
| Utility methods | `get_books_by_genre`, `get_popular_books`, `get_data_info` |

### 3.2 `feature_engineering.py`
Creates a **dense numeric embedding** for every book.

Core feature groups (29 total):
1. **Ratings** – normalised average rating, bucket one-hots (high, very high …)  
2. **Popularity** – log-scaled `ratings_count` percentiles  
3. **Language** – top-X language one-hots (`lang_eng`, `lang_en-US`, …)  
4. **Content** – TF-IDF optional (title & authors) *(omitted in fallback)*  
5. **Author popularity** – log normalised number of titles by same author  
6. **Sentiment** – mean sentiment score of sample reviews (via `sentiment_analysis.py`)

All features are **MinMax-scaled** to [0,1] ⇒ KNN distance meaningful.

### 3.3 `sentiment_analysis.py`
Light-weight **Naïve Bayes** text classifier trained on 100 synthetic reviews (50 positive / 50 negative).
- Uses `nltk` for tokenisation *(downloaded on first run)*.
- Caches model & vectoriser via `joblib` ⇒ loaded in <100 ms on restart.
- Provides single & batch `predict_sentiment()` utilities consumed by feature engineer.

### 3.4 `recommendation_engine.py`
| Layer | Detail |
|---|---|
| **Advanced model** | 30-dim feature matrix + `NearestNeighbors(algorithm='brute', metric='cosine', k=10)`  |
| **Fallback model** | 8-dim simplified feature set (rating, popularity, top languages, author popularity) – always trains successfully |
| Persistence | `recommendation_model.pkl` contains KNN + data + feature names for instant reload |
| API helpers | `get_book_recommendations_by_title`, `get_popular_books_by_category`, etc. |
| Similarity calc | Cosine distance **d ∈ [0,2]** → `similarity = (2 − d) / 2`  ⇒ 1 = identical, 0 = orthogonal |

### 3.5 `genre_recommender.py`
- Wraps `recommendation_engine` with **business rules** (genre keyword dictionaries).
- Caches singleton instance via `_recommender_instance`.
- Public helpers used by API:  `recommend_books`, `get_available_genres`, `get_genre_info`, `search_books`.

### 3.6 `main.py` (FastAPI)
Endpoint | Description | Key Params
---|---|---
`GET /genres` | List all recognised genres | –
`GET /genre/{genre}/info` | Stats, keywords, sample titles | `genre`
`GET /recommend` | Genre-specific recs | `genre`, `limit`
`GET /search` | Title/author search | `q`
`GET /books/similar` | **Book-to-book** similarity | `title`, `limit`

**Startup flow** (`@app.on_event("startup")`) ensures the recommender is loaded once → zero cold-start on first user request.

---

## 4. Model Lifecycle
1. **First launch**
   - No `.pkl` ⇒ advanced model trains (takes ~40 s on laptop)
   - Saved to `recommendation_model.pkl`
2. **Subsequent launches**
   - Model deserialises in <2 s  
   - If corrupted/missing ⇒ retrains automatically (falls back to basic model on failure)

### Hot-Swap / Retrain
```bash
rm backend/recommendation_model.pkl  # force retrain on next startup
```

---

## 5. Request-to-Response Trace (Book-to-Book Example)
1. **Frontend** hits `/books/similar?title=Dune&limit=6`
2. FastAPI ➜ `get_recommender()` (singleton) ➜ `recommendation_engine.get_book_recommendations_by_title()`
3. Steps inside engine:
   - Locate index of *"Dune"* (fuzzy title match) ⇒ idx = 1234
   - Retrieve its 29-dim feature vector
   - KNN query ⇒ distances `[0,0.12,0.17,…]`
   - Convert distances → similarities `[1.0,0.94,0.92,…]`
   - Build JSON objects (title, author, rating, similarity, ratings_count)
4. FastAPI responds in **~30 ms** (model loaded in memory)

---

## 6. Performance & Scaling Notes
- **In-memory KNN** on 11 k samples is trivial (< 200 MB RAM).  
  Horizontal scaling = run multiple app instances behind a load-balancer.
- For > 1 M books ➜ switch to **Approximate Nearest Neighbours** (FAISS / Annoy).

---

## 7. Extensibility Checklist
| Task | File / Hint |
|---|---|
| Add new REST endpoint (e.g. personalised recs) | `main.py` ➜ new `@app.post` and call engine method |
| Inject new feature (e.g. Goodreads tags) | Implement in `feature_engineering.py`, retrain model |
| Swap classifier (e.g. BERT sentiment) | Update `sentiment_analysis.py` |
| Multi-tenancy / per-user models | Wrap `recommendation_engine` in a user scope, persist separate `.pkl`s |

---

## 8. FAQ for Presenters
1. **“Is this collaborative filtering?”**  
   No – it’s **content-based** (no user interaction matrix needed).
2. **“Why KNN, not deep learning?”**  
   Simplicity, explainability, and instant retraining on commodity hardware.
3. **“How is similarity computed?”**  
   Cosine similarity in a 29-dim feature space; distance → similarity conversion shown in §3.4.
4. **“What happens if the advanced model fails?”**  
   Automated fallback to an 8-feature basic model ensures uptime.
5. **“How to retrain with fresh data?”**  
   Replace `books.csv` and delete `recommendation_model.pkl` – startup will retrain.

---

## 9. Appendix – Key Environment Versions
```
Python          3.11+
FastAPI         0.110+
scikit-learn    1.4+
Pandas          2.2+
NumPy           2.0+
NLTK            3.8+
Joblib          1.4+
Uvicorn         0.29+
``` 