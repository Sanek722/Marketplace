import re
import json
import nltk
import requests
from sklearn.cluster import DBSCAN
from sentence_transformers import SentenceTransformer
from rake_nltk import Rake
from nltk.corpus import stopwords

# Загрузка ресурсов
nltk.download("stopwords")
nltk.download("punkt")
russian_stopwords = stopwords.words("russian")

# Модель эмбеддингов
embedder = SentenceTransformer("all-mpnet-base-v2")

def clean_text(text):
    """Очищает текст: убирает лишние знаки препинания, кроме важных для структуры."""
    text = text.lower()
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[^\w\s\*\-]', '', text)  # Оставляем * и - (например для списков)
    return text

def clean_summary(summary):
    """Вырезает текст между последними вхождениями **Начало обзора** и **Конец обзора**."""
    start_marker = "**Начало обзора**"
    end_marker = "**Конец обзора**"

    # Находим индексы всех вхождений маркеров
    start_idx = -1
    end_idx = -1

    # Начинаем искать с конца текста, чтобы взять последние вхождения
    temp_start_idx = summary.rfind(start_marker)
    temp_end_idx = summary.rfind(end_marker)

    if temp_start_idx != -1 and temp_end_idx != -1 and temp_start_idx < temp_end_idx:
        # Если нашли маркеры, то теперь вырезаем текст между ними
        start_idx = temp_start_idx + len(start_marker)  # Начинаем после "**Начало обзора**"
        end_idx = temp_end_idx
        review = summary[start_idx:end_idx].strip()
        return review
    else:
        return ""  # Если маркеры не найдены, возвращаем пустую строку

def query_hf_api(payload):
    """Отправляет запрос к локальному API генерации текста."""
    data = {"prompt": payload["inputs"]}
    try:
        response = requests.post("https://ef22-34-125-25-227.ngrok-free.app/generate/", json=data, timeout=420)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Ошибка запроса к API: {e}")
        return {"summary": "Ошибка генерации"}

def filter_reviews(reviews, min_length=2):
    """Отбрасывает слишком короткие отзывы."""
    return [r for r in reviews if len(r["text"].split()) >= min_length]


def clean_combine_summary(combined_summary):
    last_index = combined_summary.rfind("Ответ:")

    # Обрезать текст от последнего "Ответ:" до конца
    if last_index != -1:
        trimmed_text = combined_summary[last_index + len("Ответ:"):].strip()
    else:
        trimmed_text = combined_summary

    return trimmed_text

class ReviewProcessor:
    def __init__(self, reviews, product_name="товар"):
        # Предобработка отзывов
        for r in reviews:
            r["text"] = clean_text(r["text"])
        self.reviews = reviews
        self.product_name = product_name

    def cluster_reviews(self, eps=0.3, min_samples=1):
        """Кластеризует отзывы на основе эмбеддингов и DBSCAN."""
        embeddings = embedder.encode([r["text"] for r in self.reviews], convert_to_numpy=True)
        clustering = DBSCAN(eps=eps, min_samples=min_samples, metric="cosine").fit(embeddings)

        clustered_reviews = {}
        for idx, label in enumerate(clustering.labels_):
            if label == -1:
                continue  # Отбросить шум
            clustered_reviews.setdefault(label, []).append(self.reviews[idx])
        return clustered_reviews

    def extract_key_aspects(self, reviews):
        """Извлекает ключевые аспекты с помощью RAKE."""
        text = " ".join([r["text"] for r in reviews])
        rake_extractor = Rake(stopwords=russian_stopwords, language='russian', min_length=1, max_length=4)
        rake_extractor.extract_keywords_from_text(text)
        phrases = rake_extractor.get_ranked_phrases()[:5]
        return ", ".join(phrases)

    def generate_summary(self, reviews):
        """Генерирует краткий обзор отзывов."""
        reviews_text = "; ".join([r["text"] for r in reviews])
        first_word_name = self.product_name.split()[0]
        prompt = f"""
Ты — помощник, который формирует краткий структурированный обзор на {first_word_name}. Используй только информацию в отзывах. 
Не добавляй никаких деталей, которых нет. Не придумывай отзывы!
Строго следуй этой структуре:

**Основные плюсы:**
* (пункт 1)
* (пункт 2)
* (пункт 3)

**Основные минусы:**
* (пункт 1)
* (пункт 2)

**Вывод:**
(короткий итог, стоит покупать или нет)


Ответ обязан начинаться с фразы "**Начало обзора**".
Ответ обязан закончиться фразой "**Конец обзора**".

Отзывы:
{reviews_text}
##Конец отзывов##
"""

        payload = {"inputs": prompt}
        response = query_hf_api(payload)
        summary = response.get("summary", "Ошибка генерации")

        return clean_summary(summary)

    def combine_summaries(self, summaries):
        """Объединяет кластерные выжимки в одно итоговое резюме."""
        first_word_name = self.product_name.split()[0]
        summaries_text = "\n\n".join(
            [s["summary"].strip() for s in summaries if s["summary"].strip() != "Недостаточно данных."])

        if not summaries_text.strip():
            return "Недостаточно информации для итогового резюме."

        prompt = f"""
Ты — помощник, который составляет общий обзор на {first_word_name} на основе других обзоров. 
Выдели все плюсы и минусы из обзоров. Сформируй вывод по ним. Следуй структуре:

**Основные плюсы:**
* (пункт 1)
* (пункт 2)

**Основные минусы:**
* (пункт 1)
* (пункт 2)

**Вывод:**
(итог в 1-2 предложениях)

Используй только информацию из обзоров ниже. Не добавляй ничего от себя.
Твой ответ обязан начаться с фразы " Ответ: ".

Обзоры:
{summaries_text}
##Конец Обзоров##
"""
        payload = {"inputs": prompt}
        response = query_hf_api(payload)
        combined_summary = response.get("summary", "Ошибка генерации")

        combined_summary = clean_combine_summary(combined_summary)

        return combined_summary

    def summarize_reviews(self):
        """Основной процесс: кластеризация, генерация кратких обзоров и итогового резюме."""
        clustered = self.cluster_reviews()
        summary_list = []

        for cluster_id, reviews in clustered.items():
            filtered_reviews = filter_reviews(reviews)
            if not filtered_reviews:
                continue

            aspect = self.extract_key_aspects(filtered_reviews)
            summary_text = self.generate_summary(filtered_reviews)

            summary_list.append({
                "aspect": aspect,
                "summary": summary_text,
                "count": len(filtered_reviews),
                "review_ids": [r["id"] for r in filtered_reviews]
            })

        final_summary = self.combine_summaries(summary_list)

        return {
            "cluster_summaries": summary_list,
            "final_summary": final_summary
        }

if __name__ == "__main__":
    with open('dataset/converted_product2.json', 'r', encoding='utf-8') as file_read:
        data = json.load(file_read)

    for product in data["products"]:
        print(f"\nОбработка продукта: {product['name']}")
        reviews = product.get("reviews", [])
        if not reviews:
            continue

        processor = ReviewProcessor(reviews)
        generated = processor.summarize_reviews()
        product["generated_summaries"] = generated

    with open('dataset/processed_products.json', 'w', encoding='utf-8') as file_write:
        json.dump(data, file_write, indent=4, ensure_ascii=False)