# DilderGames — маркетплейс цифровых игровых товаров

Закрытый маркетплейс для продажи цифровых игровых товаров. Все товары
выставляются только владельцем площадки (администратором). Покупатели могут
просматривать каталог, искать товары, оформлять заказы и связываться с
продавцом.

## Технологический стек

- **Next.js 15** (App Router, React Server Components)
- **TypeScript**
- **Tailwind CSS 3**
- **PostgreSQL** + **Prisma ORM**
- **jose** — JWT-сессии администратора (httpOnly cookie)
- **zod** — валидация входных данных
- **bcryptjs** — хеширование паролей администратора

## Структура проекта

```
nexus-marketplace/
├── prisma/
│   ├── schema.prisma      # Схема БД (Admin, Game, Category, Product, Order)
│   └── seed.ts            # Демо-данные + первый администратор
├── public/
│   └── uploads/           # Загруженные изображения
├── src/
│   ├── app/
│   │   ├── admin/         # Админ-панель (защищена серверной авторизацией)
│   │   │   ├── login/     # Страница входа
│   │   │   ├── products/  # Управление товарами
│   │   │   ├── games/     # Управление играми
│   │   │   ├── categories/# Управление категориями
│   │   │   └── orders/    # Управление заказами
│   │   ├── api/
│   │   │   ├── admin/     # API админки (CRUD + авторизация)
│   │   │   ├── orders/    # Публичное API оформления заказа
│   │   │   ├── search/    # Поиск игр и товаров
│   │   │   └── upload/    # Загрузка изображений (только админ)
│   │   ├── game/[slug]/   # Страница игры
│   │   ├── product/[id]/  # Карточка товара + покупка
│   │   ├── order/[id]/success/  # Подтверждение заказа
│   │   ├── catalog/       # Каталог игр
│   │   ├── search/        # Страница поиска
│   │   ├── rules/         # Правила площадки
│   │   ├── contacts/      # Контакты
│   │   ├── delivery/      # Как получить товар
│   │   └── page.tsx       # Главная страница
│   ├── components/        # UI-компоненты
│   ├── lib/               # Серверные утилиты (БД, авторизация, валидация)
│   └── middleware.ts      # Защита /admin/*
├── .env.example           # Шаблон переменных окружения
├── .gitignore
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Установка

### 1. Требования

- **Node.js 18.18+** (рекомендуется 20+)
- **PostgreSQL 14+**

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка базы данных PostgreSQL

Создайте базу данных:

```sql
CREATE DATABASE nexus;
```

Или через psql:

```bash
createdb nexus
```

### 4. Настройка переменных окружения

Скопируйте шаблон:

```bash
cp .env.example .env
```

Заполните `.env`:

```env
# Подключение к PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/nexus?schema=public"

# Секрет для подписи сессий (сгенерируйте: openssl rand -base64 32)
SESSION_SECRET="your-secret-key-min-16-chars"

# Первый администратор (для seed-скрипта)
SEED_ADMIN_EMAIL="admin@nexus.gg"
SEED_ADMIN_PASSWORD="your-strong-password"

# Демо-данные при seed (true/false)
SEED_DEMO_DATA="true"
```

### 5. Применение схемы БД и генерация клиента

```bash
npx prisma db push
npx prisma generate
```

Или через миграции:

```bash
npx prisma migrate dev --name init
```

### 6. Заполнение демо-данными

```bash
npm run db:seed
```

Скрипт создаст:
- Первого администратора (email/пароль из `.env`)
- 8 демо-игр (Minecraft, GTA V, GTA Online, Roblox, Brawl Stars, Fortnite, CS2, Steam)
- Категории для каждой игры
- 8 тестовых товаров (помечены `isTest = true`)

### 7. Запуск

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

Админ-панель: [http://localhost:3000/admin](http://localhost:3000/admin)

Войдите с email и паролем администратора из `.env`.

## Удаление тестовых данных

### Вариант 1: Через SQL

```sql
DELETE FROM "OrderItem";
DELETE FROM "Order";
DELETE FROM "Product" WHERE "isTest" = true;
```

### Вариант 2: Через админ-панель

1. Перейдите в **Товары** → фильтр **Тестовые**
2. Выберите и удалите все товары

### Вариант 3: Полный сброс

```bash
npx prisma migrate reset
npm run db:seed
```

## Резервное копирование базы данных

### Экспорт дампа

```bash
pg_dump -U postgres -d nexus > nexus-backup-$(date +%Y%m%d).sql
```

### Импорт дампа

```bash
psql -U postgres -d nexus < nexus-backup-20261013.sql
```

### Автоматизация (Windows, через планировщик задач)

Создайте файл `backup.bat`:

```bat
@echo off
set BACKUP_DIR=C:\backups\nexus
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"
pg_dump -U postgres -d nexus > "%BACKUP_DIR%\nexus-backup-%DATE:~6,4%%DATE:~3,2%%DATE:~0,2%.sql"
```

Добавьте задачу в планировщик задач Windows с ежедневным запуском.

## Публикация в интернете

### Вариант 1: Vercel (рекомендуется для Next.js)

1. Загрузите проект на GitHub/GitLab
2. Перейдите на [vercel.com](https://vercel.com) → New Project → импортируйте репозиторий
3. Добавьте переменные окружения в Settings → Environment Variables
4. Настройте внешнюю PostgreSQL (например, Neon, Supabase, Railway)
5. При деплое Vercel автоматически выполнит `prisma generate` и `prisma db push` (добавьте в build command: `prisma db push && next build`)

### Вариант 2: VPS (Ubuntu + Node.js)

```bash
# 1. Установите Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 2. Установите PostgreSQL
sudo apt install -y postgresql
sudo -u postgres createdb nexus

# 3. Клонируйте проект
git clone <your-repo> /opt/nexus
cd /opt/nexus

# 4. Установите зависимости
npm ci

# 5. Настройте .env
cp .env.example .env
nano .env

# 6. Примените схему и сгенерируйте клиент
npx prisma db push
npx prisma generate

# 7. Заполните демо-данными
npm run db:seed

# 8. Соберите и запустите
npm run build
npm run start

# Или через PM2:
# npm install -g pm2
# pm2 start npm --name nexus -- start
```

### Вариант 3: Docker

Создайте `Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t nexus-marketplace .
docker run -p 3000:3000 --env-file .env nexus-marketplace
```

## Безопасность

- Пароль администратора хешируется bcrypt (cost 10)
- Сессия — JWT в httpOnly cookie, подписанный SESSION_SECRET
- Все админские API проверяют сессию на сервере через `requireAdmin()`
- Middleware защищает `/admin/*` от неавторизованных пользователей
- Цена и остаток товара проверяются на сервере при оформлении заказа
- Остаток уменьшается атомарно (`updateMany` с условием `stock > 0`)
- Загрузка файлов: только изображения (JPG/PNG/WebP/GIF), до 5 МБ, только для админа
- Лимит попыток входа в админку: 5 попыток за 15 минут
- Личные данные покупателей не отображаются публично

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск в режиме разработки |
| `npm run build` | Сборка для продакшена |
| `npm run start` | Запуск продакшен-сборки |
| `npm run db:push` | Применить схему БД без миграций |
| `npm run db:migrate` | Создать и применить миграцию |
| `npm run db:seed` | Заполнить демо-данными и создать админа |
| `npm run db:studio` | Открыть Prisma Studio (визуальный редактор БД) |

## Переменные окружения

| Переменная | Описание | Обязательная |
|------------|----------|--------------|
| `DATABASE_URL` | Строка подключения к PostgreSQL | Да |
| `SESSION_SECRET` | Секрет для подписи JWT-сессий (мин. 16 символов) | Да |
| `SEED_ADMIN_EMAIL` | Email первого администратора | Только для seed |
| `SEED_ADMIN_PASSWORD` | Пароль первого администратора | Только для seed |
| `SEED_DEMO_DATA` | Загружать ли демо-данные при seed (`true`/`false`) | Нет |
| `NEXT_PUBLIC_SITE_URL` | Базовый URL сайта | Нет |

## Лицензия

Демонстрационный проект. Все игровые товары принадлежат их правообладателям.
