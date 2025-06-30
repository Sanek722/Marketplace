from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import json
import os

app = FastAPI()

# Путь к файлу с результатами выжимки
SUMMARY_FILE_PATH = "processed_productss.json"


@app.post("/summarize")
async def get_summaries():
    if not os.path.exists(SUMMARY_FILE_PATH):
        raise HTTPException(status_code=404, detail="Файл с выжимками не найден")
    try:
        with open(SUMMARY_FILE_PATH, "r", encoding="utf-8") as file:
            data = json.load(file)
        return JSONResponse(content=data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка при чтении файла: {e}")
