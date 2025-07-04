# Маркетплейс с модулем анализа отзывов (дипломный проект)

Микросервисный маркетплейс с модулем анализа пользовательских отзывов на основе алгоритмов обработки естественного языка (NLP).

## ⚙️ Стек технологий

- Java 17, Spring Boot, Spring Security, REST API
- PostgreSQL, Redis Sentinel
- API Gateway с авторизацией и маршрутизацией
- React (Vite + JSX)
- Python, FastAPI (модуль анализа отзывов)
- NLP: RAKE, DBSCAN, MPNet, Mistral

## Основной функционал

- Регистрация и авторизация с помощью JWT (Spring Security + Redis Sentinel)
- Централизованная проверка токена и роли пользователя через API Gateway
- Каталог товаров, просмотр и публикация отзывов
- Анализ отзывов на стороне Python-сервиса:
  - Извлечение аспектов через RAKE
  - Кластеризация тональности с помощью DBSCAN
  - Векторизация и классификация на базе MPNet и Mistral

## Архитектура проекта

Проект состоит из нескольких микросервисов:

- authService — регистрация, вход, токены
- gateway — маршрутизация и авторизация по ролям
- Market — каталог товаров, отзывы, покупки
- module_review — анализ отзывов (FastAPI + ML)
- marketplace-frontend — React-интерфейс для пользователя

Все сервисы взаимодействуют через REST API.

## 🧠 Особенности реализации

- Разделение по ролям (пользователь/админ) реализовано на уровне API Gateway с централизованной валидацией JWT‑токенов и пробросом ролей в другие сервисы
- Redis Sentinel используется для отказоустойчивого хранения токенов
- Интеграция Python‑сервиса с Java‑экосистемой через HTTP-запросы
- Реализовано автоматизированное извлечение смысловых аспектов из отзывов, группировака схожих тематик отзывов, генерация резюме товара по отзывам.

## 🔒 Безопасность

- Проверка JWT и роли пользователя происходит на уровне API Gateway
- Доступ к защищённым маршрутам ограничен в зависимости от прав

## 📌 В планах

- Улучшение интерфейса
