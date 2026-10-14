import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";

const prisma = new PrismaClient();

/**
 * Скрипт первичного наполнения:
 * 1. Создаёт первого администратора (если его нет).
 * 2. Добавляет демо-игры, категории и тестовые товары.
 *
 * Демо-товары помечены флагом isTest и могут быть удалены одним запросом:
 *   DELETE FROM "Product" WHERE "isTest" = true;
 * или через админ-панель (фильтр «Тестовые» → удалить).
 */

/**
 * Генерирует случайный пароль администратора, если SEED_ADMIN_PASSWORD
 * не задан. Предсказуемого пароля по умолчанию в репозитории больше нет:
 * прежний дефолт удалён, так как репозиторий публичный.
 */
function generateAdminPassword(): string {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#%*_-";
  let password = "";
  while (password.length < 20) {
    const bytes = randomBytes(64);
    for (const b of bytes) {
      if (password.length >= 20) break;
      // Отбрасываем края диапазона, чтобы не было смещения по модулю
      if (b < 256 - (256 % alphabet.length)) {
        password += alphabet[b % alphabet.length];
      }
    }
  }
  return password;
}

async function main() {
  // ===== 1. Администратор =====
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@nexus.gg";
  const passwordFromEnv = Boolean(process.env.SEED_ADMIN_PASSWORD);
  const password = process.env.SEED_ADMIN_PASSWORD ?? generateAdminPassword();

  const existingAdmin = await prisma.admin.findUnique({ where: { email } });
  if (!existingAdmin) {
    await prisma.admin.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 10),
        name: "Владелец площадки",
      },
    });
    console.log(`✓ Администратор создан: ${email}`);
    if (!passwordFromEnv) {
      console.log("  SEED_ADMIN_PASSWORD не задан — пароль сгенерирован:");
      console.log(`  ${password}`);
      console.log("  Сохраните его: больше он нигде не отображается.");
    }
  } else {
    console.log(`• Администратор ${email} уже существует`);
  }

  // ===== 2. Демо-игры и товары =====
  if (process.env.SEED_DEMO_DATA === "false") {
    console.log("• Демо-данные отключены (SEED_DEMO_DATA=false)");
    return;
  }

  const existingGames = await prisma.game.count();
  if (existingGames > 0) {
    console.log("• Игры уже существуют, пропускаем демо-наполнение");
    return;
  }

  // --- Категории и игры ---
  const gamesData: {
    slug: string;
    title: string;
    description: string;
    isPopular: boolean;
    sortOrder: number;
    categories: string[];
  }[] = [
    {
      slug: "minecraft",
      title: "Minecraft",
      description:
        "Легендарная песочница с бесконечными возможностями. Аккаунты, ключи, валюта серверов и услуги для любых версий игры.",
      isPopular: true,
      sortOrder: 1,
      categories: ["Аккаунты", "Ключи и подписки", "Валюта", "Услуги"],
    },
    {
      slug: "gta-v",
      title: "GTA V",
      description:
        "Grand Theft Auto V — открытый мир Лос-Сантоса. Аккаунты Rockstar, наборы для старта и бусты для GTA Online.",
      isPopular: true,
      sortOrder: 2,
      categories: ["Аккаунты", "Бусты", "Наборы"],
    },
    {
      slug: "gta-online",
      title: "GTA Online",
      description:
        "Мультиплеерный режим GTA V. Доллары, бизнесы, уровни и персонажи с полным доступом к онлайн-режиму.",
      isPopular: true,
      sortOrder: 3,
      categories: ["Валюта", "Персонажи", "Бизнесы"],
    },
    {
      slug: "roblox",
      title: "Roblox",
      description:
        "Миллионы миров и игр в одной платформе. Аккаунты с редкими предметами, Robux и подарочные карты.",
      isPopular: true,
      sortOrder: 4,
      categories: ["Аккаунты", "Валюта", "Подарочные карты"],
    },
    {
      slug: "brawl-stars",
      title: "Brawl Stars",
      description:
        "Динамичный мобильный отрядный шутер. Аккаунты с редкими бравлерами, гемы и боевые пропуска.",
      isPopular: false,
      sortOrder: 5,
      categories: ["Аккаунты", "Валюта"],
    },
    {
      slug: "fortnite",
      title: "Fortnite",
      description:
        "Королевская битва от Epic Games. Аккаунты со скинами, V-Bucks и боевыми пропусками.",
      isPopular: true,
      sortOrder: 6,
      categories: ["Аккаунты", "Валюта", "Скины"],
    },
    {
      slug: "cs2",
      title: "Counter-Strike 2",
      description:
        "Легендарный тактический шутер. Аккаунты с прайм-статусом, скины и наклейки для CS2.",
      isPopular: true,
      sortOrder: 7,
      categories: ["Аккаунты", "Скины", "Услуги"],
    },
    {
      slug: "steam",
      title: "Steam",
      description:
        "Крупнейшая игровая платформа. Подарочные карты, ключи активации и услуги для аккаунта Steam.",
      isPopular: false,
      sortOrder: 8,
      categories: ["Подарочные карты", "Ключи"],
    },
  ];

  for (const g of gamesData) {
    const game = await prisma.game.create({
      data: {
        slug: g.slug,
        title: g.title,
        description: g.description,
        isPopular: g.isPopular,
        sortOrder: g.sortOrder,
      },
    });

    for (let i = 0; i < g.categories.length; i++) {
      await prisma.category.create({
        data: {
          slug: g.categories[i].toLowerCase().replace(/\s+/g, "-"),
          name: g.categories[i],
          gameId: game.id,
          sortOrder: i + 1,
        },
      });
    }
    console.log(`✓ Игра создана: ${g.title}`);
  }

  // --- Демо-товары (явно помечены как тестовые) ---
  const allCategories = await prisma.category.findMany({
    include: { game: true },
  });

  function findCat(gameSlug: string, catName: string) {
    return allCategories.find(
      (c) => c.game.slug === gameSlug && c.name === catName
    );
  }

  const productsData: {
    gameSlug: string;
    category: string;
    title: string;
    description: string;
    price: number;
    oldPrice?: number;
    stock: number;
    isPopular?: boolean;
  }[] = [
    {
      gameSlug: "minecraft",
      category: "Аккаунты",
      title: "Аккаунт Minecraft: Java Edition (лицензия)",
      description:
        "Лицензионный аккаунт Minecraft Java Edition с полным доступом. Полная смена всех данных: почта, пароль, никнейм. Подходит для серверов и одиночной игры.\n\nТестовый товар для демонстрации каталога.",
      price: 490,
      oldPrice: 790,
      stock: 12,
      isPopular: true,
    },
    {
      gameSlug: "minecraft",
      category: "Аккаунты",
      title: "Аккаунт Minecraft Bedrock + Java (Microsoft)",
      description:
        "Аккаунт с привязкой Microsoft, включает обе версии: Java и Bedrock. Полный доступ к профилю и настройкам безопасности.\n\nТестовый товар для демонстрации каталога.",
      price: 690,
      stock: 7,
      isPopular: true,
    },
    {
      gameSlug: "gta-online",
      category: "Валюта",
      title: "GTA $1 000 000 — доллары GTA Online (ПК)",
      description:
        "Внутриигровые дollars для GTA Online на ПК. Начисление через легальный способ за 24-48 часов. Подходит для новых и существующих персонажей.\n\nТестовый товар для демонстрации каталога.",
      price: 290,
      oldPrice: 350,
      stock: 50,
      isPopular: true,
    },
    {
      gameSlug: "gta-online",
      category: "Персонажи",
      title: "Персонаж GTA Online 120 уровня",
      description:
        "Готовый персонаж 120 уровня с полным доступом к профилю: почта, пароль, привязка соцсетей. Все разблокировки и достижения сохранены.\n\nТестовый товар для демонстрации каталога.",
      price: 1290,
      oldPrice: 1690,
      stock: 5,
    },
    {
      gameSlug: "roblox",
      category: "Аккаунты",
      title: "Аккаунт Roblox с редкими предметами",
      description:
        "Аккаунт с коллекцией редких предметов и полным доступом. Почта и пароль передаются полностью.\n\nТестовый товар для демонстрации каталога.",
      price: 890,
      stock: 3,
    },
    {
      gameSlug: "fortnite",
      category: "Аккаунты",
      title: "Аккаунт Fortnite со скинами OG",
      description:
        "Аккаунт Fortnite с эксклюзивными скинами и полным доступом к Epic Games. Привязка смена всех данных.\n\nТестовый товар для демонстрации каталога.",
      price: 1490,
      stock: 2,
      isPopular: true,
    },
    {
      gameSlug: "cs2",
      category: "Аккаунты",
      title: "Аккаунт CS2 с Prime-статусом",
      description:
        "Аккаунт Counter-Strike 2 с прайм-статусом и полным доступом. Подходит для рейтинговой игры и турниров.\n\nТестовый товар для демонстрации каталога.",
      price: 590,
      oldPrice: 750,
      stock: 15,
    },
    {
      gameSlug: "steam",
      category: "Подарочные карты",
      title: "Подарочная карта Steam 1000 ₽",
      description:
        "Цифровая карта пополнения Steam номиналом 1000 рублей. Код отправляется после подтверждения заказа.\n\nТестовый товар для демонстрации каталога.",
      price: 1050,
      stock: 25,
    },
  ];

  for (const p of productsData) {
    const cat = findCat(p.gameSlug, p.category);
    if (!cat) continue;
    await prisma.product.create({
      data: {
        title: p.title,
        description: p.description,
        price: p.price,
        oldPrice: p.oldPrice ?? null,
        stock: p.stock,
        isPopular: p.isPopular ?? false,
        isHidden: false,
        isTest: true, // все демо-товары помечены как тестовые
        gameId: cat.gameId,
        categoryId: cat.id,
      },
    });
    console.log(`✓ Товар создан: ${p.title}`);
  }

  console.log("\n✓ Демо-данные загружены. Все товары помечены как тестовые (isTest).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
