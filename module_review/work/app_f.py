from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi import Request
from review_processor import ReviewProcessor
import json
import os

app = FastAPI()

# Путь к файлу с результатами выжимки
SUMMARY_FILE_PATH = "../dataset/processed_products.json"


@app.post("/summarize")
async def summarize(request: Request):
    try:
        body = await request.json()
        product_name = body.get("name", "товар")
        reviews = body.get("reviews", [])
        with open("incoming_reviews.json", "w", encoding="utf-8") as debug_file:
            json.dump(body, debug_file, indent=4, ensure_ascii=False)

        if not reviews:
            raise HTTPException(status_code=400, detail="Нет отзывов для анализа")

        processor = ReviewProcessor(reviews, product_name)
        generated = processor.summarize_reviews()

        result = {
            "products": [
                {
                    "name": product_name,
                    "reviews": reviews,
                    "generated_summaries": generated
                }
            ]
        }

        # Записываем файл
        with open("processed_productss.json", "w", encoding="utf-8") as f:
            json.dump(result, f, indent=4, ensure_ascii=False)

        return JSONResponse(content=result)

    except Exception as e:
        print(f"Ошибка сервера: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка при обработке: {e}")
