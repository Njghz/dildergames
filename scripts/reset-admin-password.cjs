// Сброс пароля администратора в любой базе данных (локальной или облачной).
//
// Запуск из папки проекта:
//   $env:DATABASE_URL = "строка_подключения"
//   $env:ADMIN_EMAIL = "admin@nexus.gg"
//   $env:ADMIN_PASSWORD = "новый_пароль"
//   npm run admin:reset
//
// Переменные ADMIN_EMAIL и ADMIN_PASSWORD обязательны: без них скрипт ничего
// не меняет, чтобы случайно не создать/изменить не тот аккаунт.
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

function safeHost(url) {
  if (!url) return "(не задана)";
  try {
    return new URL(url).host;
  } catch {
    return "(не разобрать)";
  }
}

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log(
      "Не заданы ADMIN_EMAIL или ADMIN_PASSWORD.\n" +
        "Пример:\n" +
        '  $env:ADMIN_EMAIL = "admin@nexus.gg"\n' +
        '  $env:ADMIN_PASSWORD = "новый_пароль"\n' +
        "  npm run admin:reset"
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.log("Пароль слишком короткий: нужно минимум 8 символов.");
    process.exit(1);
  }

  console.log("DB host:", safeHost(process.env.DATABASE_URL));
  console.log("Аккаунт:", email);

  const prisma = new PrismaClient();

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    console.log(
      `Администратор ${email} не найден в этой базе.\n` +
        "Возможно, база не та, либо нужно сначала выполнить npm run db:seed."
    );
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.admin.update({
    where: { email },
    data: { passwordHash },
  });

  // Проверяем, что новый пароль действительно подходит
  const check = await prisma.admin.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, check.passwordHash);
  console.log("Проверка нового пароля:", ok ? "OK" : "НЕ СОШЁЛСЯ");

  if (ok) {
    console.log("Готово. Новый пароль:");
    console.log(password);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.log("ОШИБКА:", e && e.message ? e.message.split("\n")[0] : e);
  process.exit(1);
});
