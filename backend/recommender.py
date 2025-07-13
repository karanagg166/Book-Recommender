import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns


import os
for dirname, _, filenames in os.walk('/kaggle/input'):
    for filename in filenames:
        print(os.path.join(dirname, filename))

data = pd.read_csv("books.csv", on_bad_lines='skip')
data.head()





top_books = data[data['ratings_count'] > 1000000]
top_books = top_books.sort_values(by='average_rating', ascending=False).head(20)

#top 20 rated books
sns.set(style="darkgrid")
plt.figure(figsize=(10, 10))

color = sns.color_palette("Set2")
ax = sns.barplot(x="average_rating", y="title", data=top_books, palette=color)

for i in ax.patches:
    ax.text(i.get_width() + .05, i.get_y() + 0.5, str(i.get_width()), fontsize = 10, color = 'k')
plt.show()

top_vote = data.sort_values(by='ratings_count', ascending=False).head(20)


sns.set(style="darkgrid")
plt.figure(figsize=(10, 10))

color = sns.color_palette("Set2")
ax = sns.barplot(x="ratings_count", y="title", data=top_vote, palette=color)

for i in ax.patches:
    ax.text(i.get_width() + .05, i.get_y() + 0.5, str(i.get_width()), fontsize = 10, color = 'k')
plt.show()

new_data = data.copy()


def fun_only_author(text):
    arlen = text.split('/')
    return arlen[0]


new_data['only_author'] = new_data['authors'].apply(lambda x : fun_only_author(x))


total_rating = new_data.drop_duplicates(subset=['only_author', 'title'], keep='first')
total_rating = total_rating.groupby(by=['only_author']).agg({'average_rating': ['sum']})
total_rating.columns = ['total_rating']
total_rating.reset_index(inplace=True)
total_rating = total_rating.sort_values(by=['total_rating'], ascending=False)
total_rating

total_book = new_data.groupby(by=['only_author']).agg({'title': ['nunique']})
total_book.columns = ['total_book']
total_book.reset_index(inplace=True)
total_book = total_book.sort_values(by=['total_book'], ascending=False)
total_book

avg_author = pd.merge(total_book, total_rating, on='only_author', how='outer')
avg_author['average_rating'] = round(avg_author['total_rating'] / avg_author['total_book'], 2)
avg_author = avg_author[avg_author['total_book'] > 26]
avg_author = avg_author.sort_values(by=['average_rating'], ascending=False)
avg_author

total_vote = new_data.drop_duplicates(subset=['only_author', 'title'], keep='first')
total_vote.reset_index(inplace=True)
total_vote = total_vote[['only_author', 'title', 'average_rating', 'ratings_count']]
total_vote

C = total_vote.average_rating.mean()
C

m = total_vote.ratings_count.quantile(0.9)
m

total_vote = total_vote[total_vote['ratings_count'] >= m]
total_vote.head()

def weighted_rating(x, m=m, C=C):
    v = x['ratings_count']
    R = x['average_rating']
    return (v/(v+m) * R) + (m/(m+v) * C)

total_vote['score'] = total_vote.apply(weighted_rating, axis=1)


total_vote = total_vote.sort_values(by='score', ascending=False).head(20)
total_vote

sns.set(style="darkgrid")
plt.figure(figsize=(10, 10))

color = sns.color_palette("Set2")
ax = sns.barplot(x="score", y="title", data=total_vote, palette=color)

for i in ax.patches:
    ax.text(i.get_width() + .05, i.get_y() + 0.5, str(i.get_width()), fontsize = 10, color = 'k')
plt.title("Top 20 Weighted Rating Books")
plt.show()


plt.figure(figsize=(15, 7))
ax = sns.countplot(x=data.language_code, data=data)
for p in ax.patches:
    ax.annotate(str(p.get_height()), (p.get_x()-0.05, p.get_height()+100))

ax = sns.relplot(data=data, x="average_rating", y="  num_pages", color = '#95a3c3', sizes=(100, 200), height=7, marker='o')

title_value = data.title.unique()


from wordcloud import WordCloud, STOPWORDS, ImageColorGenerator


plt.subplots(figsize=(15,15))
wordcloud = WordCloud(
                          background_color='#000',
                          width=650,
                          height=550,
                          stopwords=STOPWORDS,
                         ).generate(" ".join(title_value))
plt.imshow(wordcloud)
plt.axis('off')
plt.savefig('graph.png')

plt.figtext(.5,.91,'Data cloud of All title', color='#062175', fontsize=25, ha='center')
plt.show()

new_data.loc[ (new_data['average_rating'] >= 0) & (new_data['average_rating'] <= 1), 'rating_between'] = "between_0_to_1"
new_data.loc[ (new_data['average_rating'] > 1) & (new_data['average_rating'] <= 2), 'rating_between'] = "between_1_to_2"
new_data.loc[ (new_data['average_rating'] > 2) & (new_data['average_rating'] <= 3), 'rating_between'] = "between_2_to_3"
new_data.loc[ (new_data['average_rating'] > 3) & (new_data['average_rating'] <= 4), 'rating_between'] = "between_3_to_4"
new_data.loc[ (new_data['average_rating'] > 4) & (new_data['average_rating'] <= 5), 'rating_between'] = "between_4_to_5"

trial = new_data[['average_rating', 'ratings_count']]
data_model = np.asarray([np.asarray(trial['average_rating']), np.asarray(trial['ratings_count'])]).T
data_model

from sklearn.cluster import KMeans



score = []
x = data_model
for cluster in range(1,41):
    kmeans = KMeans(n_clusters = cluster, init="k-means++", random_state=40)
    kmeans.fit(x)
    score.append(kmeans.inertia_)

plt.figure(figsize=(15, 10))
plt.plot(range(1,41), score)
plt.title('The Elbow Method')

plt.show()

rating_between_df = new_data['rating_between'].str.get_dummies(sep=",")
rating_between_df.head()

lang_df = new_data['language_code'].str.get_dummies(sep=",")
lang_df.head()

engine_features = pd.concat([rating_between_df, lang_df, new_data['average_rating'], new_data['ratings_count']], axis=1)
engine_features.head()

sample_reviews = [
    "An absolute page-turner with a beautiful cover design.",
    "The storyline was intriguing and held my interest till the end.",
    "Great for fans of mystery and thrillers, well worth the price.",
    "The character development was impressive and relatable.",
    "A quick and enjoyable read with a simple yet elegant cover.",
    "Engaging language that flows naturally, making it hard to put down.",
    "A bit pricey, but the quality justifies it.",
    "This book has quickly become a favorite addition to my collection.",
    "Unique plot with unexpected twists – highly recommend!",
    "The cover could be more vibrant, but the story makes up for it.",
    "Loved the author’s writing style, very approachable.",
    "An excellent choice for weekend reading.",
    "Great balance between price and content quality.",
    "The language was accessible, even for casual readers.",
    "The plot felt fresh, and I enjoyed the originality.",
    "Hard to put down once you start – captivating storyline!",
    "The cover design is eye-catching and really sets the tone.",
    "Worth the price, especially for a hardcover edition.",
    "The pacing was spot-on, no dragging sections.",
    "An underrated book that deserves more recognition.",
    "Satisfying read, though a bit slow to start.",
    "The character arcs were well thought out and rewarding.",
    "Highly recommend for fans of classic fiction.",
    "Brilliant writing – the language pulls you in.",
    "A refreshing story that breaks away from clichés.",
    "Beautiful language, almost poetic in parts.",
    "A thoughtful and insightful narrative.",
    "Characters felt like real people, loved it!",
    "Ideal for anyone who loves a mystery.",
    "The story had me guessing till the very end.",
    "Easy to read, but with some meaningful moments.",
    "An affordable option for a high-quality story.",
    "Cover art was okay, but I expected more.",
    "This book is a great escape – fully engrossing!",
    "Price is on the higher side for a paperback.",
    "The storyline flows seamlessly from start to finish.",
    "The language is well-suited for younger readers.",
    "I didn’t love the cover, but the story was solid.",
    "Surprisingly good – exceeded my expectations.",
    "A story I’ll remember for a long time.",
    "Perfect for a quiet evening read.",
    "Engaging from the first page.",
    "Definitely worth adding to your collection.",
    "A beautiful blend of suspense and romance.",
    "Would love to see a sequel to this book!",
    "The language feels effortless and natural.",
    "A touching and heartfelt tale.",
    "An emotional rollercoaster.",
    "Surprisingly deep for a short book.",
    "A great story with memorable characters.",
    "Kept me engaged from start to finish.",

    "The cover design was bland and didn’t match the story.",
    "The storyline felt generic and lacked originality.",
    "The book is overpriced for the quality of content.",
    "Characters were flat and hard to connect with.",
    "A slow read with too many predictable moments.",
    "The writing style was overly complex and confusing.",
    "The cover was misleading about the book’s content.",
    "The story didn’t live up to the promising synopsis.",
    "The plot twists were obvious and didn’t surprise me.",
    "Overpriced, considering the story’s simplicity.",
    "The language felt too simplistic and unengaging.",
    "The book was much shorter than I expected for the price.",
    "Pacing was off, and the plot dragged in places.",
    "I found it difficult to relate to any of the characters.",
    "The cover didn’t match the book’s tone at all.",
    "The storyline was confusing and hard to follow.",
    "Couldn’t finish it – just didn’t hold my interest.",
    "The story lacked depth and emotional engagement.",
    "The book’s ending felt abrupt and unsatisfying.",
    "Not worth the price – a disappointing read.",
    "The language was overly simple, almost juvenile.",
    "The plot felt like a copy of several other books.",
    "Characters were one-dimensional and uninteresting.",
    "The cover design was the best part of the book.",
    "Too expensive for what it offered in content.",
    "An okay read, but not something I’d recommend.",
    "The story felt forced and uninspired.",
    "Couldn’t connect with the characters at all.",
    "Felt like a recycled plot with no new ideas.",
    "The language was stiff and hard to read.",
    "The book seemed rushed and lacked detail.",
    "Didn’t live up to the author’s previous works.",
    "Overall, a very forgettable read.",
    "The story had potential but was poorly executed.",
    "Not enough depth in the plot to keep me engaged.",
    "The cover design was misleading about the content.",
    "A disappointing read for the price.",
    "Characters felt unrealistic and underdeveloped.",
    "Expected more based on the reviews, but was let down.",
    "The book was too long for the story it had to tell.",
    "A poorly written story with a predictable ending.",
    "The plot twists felt forced and unnecessary.",
    "Too expensive for such a basic storyline.",
    "The language was dry and uninteresting.",
    "The pacing was uneven, and the story dragged.",
    "The book failed to hold my interest.",
    "Disappointing – I expected so much more.",
    "The author’s writing style didn’t appeal to me.",
    "Would not recommend to a friend.",
    "The story was all over the place with no direction."
]

num_rows = engine_features.shape[0]
reviews = sample_reviews * (num_rows // len(sample_reviews)) + sample_reviews[:num_rows % len(sample_reviews)]

engine_features['reviews'] = reviews[:num_rows]

print(engine_features.head())


import numpy as np
import pandas as pd
pd.options.mode.chained_assignment = None
import os
for dirname, _, filenames in os.walk('/kaggle/input'):
    for filename in filenames:
        print(os.path.join(dirname, filename))

from wordcloud import WordCloud
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import re
import nltk
from nltk import word_tokenize
nltk.download('stopwords')

val=pd.read_csv("twitter_validation.csv", header=None)
train=pd.read_csv("twitter_training.csv", header=None)

train.columns=['id','information','type','text']
train.head()

val.columns=['id','information','type','text']
val.head()

train_data=train
train_data

val_data = val

train_data["lower"]=train_data.text.str.lower()
train_data["lower"]=[str(data) for data in train_data.lower]
train_data["lower"]=train_data.lower.apply(lambda x: re.sub('[^A-Za-z0-9 ]+', ' ', x))
val_data["lower"]=val_data.text.str.lower()
val_data["lower"]=[str(data) for data in val_data.lower]
val_data["lower"]=val_data.lower.apply(lambda x: re.sub('[^A-Za-z0-9 ]+', ' ', x))

plot1=train.groupby(by=["information","type"]).count().reset_index()
plot1.head()

plt.figure(figsize=(20,6))
sns.barplot(data=plot1,x="information",y="id",hue="type")
plt.xticks(rotation=90)
plt.xlabel("Brand")
plt.ylabel("Number of tweets")
plt.grid()
plt.title("Distribution of tweets per Branch and Type");

import nltk
nltk.download('punkt')
tokens_text = [word_tokenize(str(word)) for word in train_data.lower]
tokens_counter = [item for sublist in tokens_text for item in sublist]
print("Number of tokens: ", len(set(tokens_counter)))

stopwords_nltk = nltk.corpus.stopwords
stop_words = stopwords_nltk.words('english')
stop_words[:5]

bow_counts = CountVectorizer(
    tokenizer=word_tokenize,
    stop_words=stop_words,
    ngram_range=(1, 1)
)

reviews_train, reviews_test = train_test_split(train_data, test_size=0.2, random_state=0)


X_train_bow = bow_counts.fit_transform(reviews_train.lower)
X_test_bow = bow_counts.transform(reviews_test.lower)

y_train_bow = reviews_train['type']
y_test_bow = reviews_test['type']

y_test_bow.value_counts() / y_test_bow.shape[0]


model1 = LogisticRegression(max_iter=200)
model1.fit(X_train_bow, y_train_bow)
test_pred = model1.predict(X_test_bow)
print("Accuracy: ", accuracy_score(y_test_bow, test_pred) * 100)

X_val_bow = bow_counts.transform(val_data.lower)
y_val_bow = val_data['type']

Val_res = model1.predict(X_val_bow)
print("Accuracy: ", accuracy_score(y_val_bow, Val_res) * 100)

bow_counts = CountVectorizer(
    tokenizer=word_tokenize,
    ngram_range=(1,4)
)
X_train_bow = bow_counts.fit_transform(reviews_train.lower)
X_test_bow = bow_counts.transform(reviews_test.lower)
X_val_bow = bow_counts.transform(val_data.lower)

model2 = LogisticRegression(max_iter=200)
model2.fit(X_train_bow, y_train_bow)
test_pred_2 = model2.predict(X_test_bow)
print("Accuracy: ", accuracy_score(y_test_bow, test_pred_2) * 100)

y_val_bow = val_data['type']
Val_pred_2 = model2.predict(X_val_bow)
print("Accuracy: ", accuracy_score(y_val_bow, Val_pred_2) * 100)

import joblib

joblib.dump(model2, 'logistic_regression_model.pkl')

joblib.dump(bow_counts, 'count_vectorizer.pkl')


import joblib

model2 = joblib.load('logistic_regression_model.pkl')
bow_counts = joblib.load('count_vectorizer.pkl')

sample_review = "best thing ever  !"

sample_review_vectorized = bow_counts.transform([sample_review.lower()])

probabilities = model2.predict_proba(sample_review_vectorized)

positive_probability = probabilities[0][1]

print(f"Positive probability: {1-positive_probability:.4f}")






import joblib
import pandas as pd

model2 = joblib.load('logistic_regression_model.pkl')
bow_counts = joblib.load('count_vectorizer.pkl')

engine_features['senti_score'] = engine_features['reviews'].apply(
    lambda x: 1 - model2.predict_proba(bow_counts.transform([x.lower()]))[0][1]
)

print(engine_features[['reviews', 'senti_score']].head(200))




engine_features = engine_features.drop(columns=['reviews'])


from sklearn.preprocessing import MinMaxScaler


min_max_scaler = MinMaxScaler()
engine_features = min_max_scaler.fit_transform(engine_features)

from sklearn import neighbors


engine_model = neighbors.NearestNeighbors(n_neighbors=6, algorithm='ball_tree')


engine_model.fit(engine_features)


dist, idlist = engine_model.kneighbors(engine_features)


def book_recommendation_engine(book_name):
    book_list_name = []
    book_id = new_data[new_data['title'] == book_name].index
    book_id = book_id[0]
    for newid in idlist[book_id]:
        book_list_name.append(new_data.loc[newid].title)
    return book_list_name


book_list_name = book_recommendation_engine('The Alchemist')
book_list_name

import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

engine_features = pd.concat(
    [rating_between_df, lang_df, new_data['average_rating'], new_data['ratings_count']],
    axis=1
)

X_scaled = StandardScaler().fit_transform(engine_features)

pca = PCA(n_components=2)
principal_components = pca.fit_transform(X_scaled)

pca_df = pd.DataFrame(data=principal_components, columns=['PC1', 'PC2'])

plt.figure(figsize=(10, 8))
plt.scatter(pca_df['PC1'], pca_df['PC2'], marker='o')

plt.title('PCA of Book Features')
plt.xlabel('Principal Component 1')
plt.ylabel('Principal Component 2')
plt.grid()
plt.show()


import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.neighbors import NearestNeighbors

class KMeans:
    def __init__(self, k, max_iters=100):
        self.k = k
        self.max_iters = max_iters

    def fit(self, X):
        self.centroids = X[np.random.choice(X.shape[0], self.k, replace=False)]
        for _ in range(self.max_iters):
            distances = self._euclidean_distance(X, self.centroids)
            self.labels = np.argmin(distances, axis=1)
            new_centroids = []
            for i in range(self.k):
                points = X[self.labels == i]
                if len(points) > 0:
                    new_centroids.append(points.mean(axis=0))
                else:
                    new_centroids.append(self.centroids[i])
            self.centroids = np.array(new_centroids)

    def _euclidean_distance(self, X, centroids):
        return np.sqrt(((X[:, np.newaxis] - centroids) ** 2).sum(axis=2))

    def predict(self, X):
        distances = self._euclidean_distance(X, self.centroids)
        return np.argmin(distances, axis=1)

def elbow_method(X, max_k):
    distortions = []
    for k in range(1, max_k + 1):
        kmeans = KMeans(k)
        kmeans.fit(X)
        distances = kmeans._euclidean_distance(X, kmeans.centroids)
        distortion = np.sum(np.min(distances, axis=1))
        distortions.append(distortion)
    return distortions

engine_features = pd.concat(
    [rating_between_df, lang_df, new_data[['average_rating', 'ratings_count']]],
    axis=1
)

X_scaled = (engine_features - engine_features.mean()) / engine_features.std()

max_k = 20
distortions = elbow_method(X_scaled.to_numpy(), max_k)


optimal_k = 3
kmeans = KMeans(optimal_k)
kmeans.fit(X_scaled.to_numpy())
clusters = kmeans.labels

class PCA:
    def fit_transform(self, X, n_components):
        X_meaned = X - np.mean(X, axis=0)
        covariance_matrix = np.cov(X_meaned, rowvar=False)
        eigenvalues, eigenvectors = np.linalg.eigh(covariance_matrix)
        sorted_indices = np.argsort(eigenvalues)[::-1]
        eigenvectors = eigenvectors[:, sorted_indices][:, :n_components]
        return X_meaned.dot(eigenvectors)

pca = PCA()
principal_components = pca.fit_transform(X_scaled.to_numpy(), 2)
pca_df = pd.DataFrame(data=principal_components, columns=['PC1', 'PC2'])

plt.figure(figsize=(10, 8))
plt.scatter(pca_df['PC1'], pca_df['PC2'], c=clusters, marker='o')
plt.title('PCA of Book Features')
plt.xlabel('Principal Component 1')
plt.ylabel('Principal Component 2')
plt.grid()
plt.show()

def book_recommendation_engine(book_name):
    book_list_name = []
    book_id = new_data[new_data['title'] == book_name].index[0]
    knn = NearestNeighbors(n_neighbors=6, algorithm='ball_tree')
    knn.fit(X_scaled)
    distances, indices = knn.kneighbors(X_scaled.iloc[[book_id]])
    for index in indices.flatten():
        book_list_name.append(new_data.iloc[index].title)
    return book_list_name

book_list_name = book_recommendation_engine('The Alchemist')
print("Recommended books:", book_list_name)










plt.figure()
plt.plot(range(1, max_k + 1), np.array(distortions) / 1000)
plt.title('Elbow Method')
plt.xlabel('Number of Clusters')
plt.ylabel('Distortion / 1000')
plt.show()