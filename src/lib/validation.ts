import { z } from "zod";

/** Валидация формы входа администратора */
export const loginSchema = z.object({
  email: z.string().email("Введите корректный e-mail"),
  password: z.string().min(1, "Введите пароль"),
});

/** Валидация формы заказа покупателя */
export const orderSchema = z.object({
  productId: z.string().min(1, "Товар не найден"),
  customerName: z
    .string()
    .trim()
    .min(1, "Укажите имя")
    .max(80, "Имя слишком длинное"),
  contact: z
    .string()
    .trim()
    .min(3, "Укажите Telegram или e-mail")
    .max(120, "Контакт слишком длинный")
    .refine(
      (v) =>
        /^@[A-Za-z0-9_]{3,32}$/.test(v) ||
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "Укажите @username в Telegram или корректный e-mail"
    ),
  comment: z.string().trim().max(1000, "Комментарий слишком длинный").optional(),
});

/** Валидация товара (админка) */
export const productSchema = z.object({
  title: z.string().trim().min(2, "Название слишком короткое").max(120),
  description: z.string().trim().max(5000).default(""),
  price: z.number().int().min(1, "Цена должна быть больше 0").max(10_000_000),
  oldPrice: z.number().int().min(1).max(10_000_000).nullable().optional(),
  stock: z.number().int().min(0, "Остаток не может быть отрицательным").max(1_000_000),
  gameId: z.string().min(1, "Выберите игру"),
  categoryId: z.string().min(1, "Выберите категорию"),
  isPopular: z.boolean().default(false),
  isHidden: z.boolean().default(false),
  isTest: z.boolean().default(false),
});

/** Валидация игры (админка) */
export const gameSchema = z.object({
  title: z.string().trim().min(2, "Название слишком короткое").max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug: только латиница, цифры и дефис"),
  description: z.string().trim().max(2000).default(""),
  isPopular: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
});

/** Валидация категории (админка) */
export const categorySchema = z.object({
  name: z.string().trim().min(2, "Название слишком короткое").max(60),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug: только латиница, цифры и дефис"),
  gameId: z.string().min(1, "Выберите игру"),
  sortOrder: z.number().int().min(0).default(0),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type GameInput = z.infer<typeof gameSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
