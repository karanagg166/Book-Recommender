from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from recommender import recommend_books

app = FastAPI()

# Allow frontend to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/recommend")
def get_recommendations(genre: str = Query(...)):
    results = recommend_books(genre)
    return {"recommendations": results}
