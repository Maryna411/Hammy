/**
 * Hammy's voice — used ONLY at emotional moments (greetings, empty states,
 * loading, celebrations, and as a light supportive line after a clear
 * technical error message). Task data, form fields and primary functional
 * copy stay neutral on purpose — see brand decision in chat.
 */
export const HAMMY = {
  onboardingWelcomeTitle: "Привіт, я Hammy",
  onboardingWelcomeText:
    "Допоможу перетворити хаос у твоїй голові на чіткий план дня. Покажу, як усе тут працює?",

  captureTitle: "Записуй усе, що в голові",
  captureSubtitle:
    "Я — Hammy. Кидай сюди все підряд, текстом чи голосом — а я розберу цей безлад на задачі. Щоки витримають.",
  listening: "Слухаю, говори — записую все до останнього слова",
  thinking: "Hammy жує... ще секунда",

  parseEmptyError:
    "AI не знайшов жодної задачі в цьому тексті. Спробуй конкретніше — навіть у хом'яка обмежена фантазія.",
  parseServerError: "Щось застрягло в щоках. Спробуй ще раз за хвилину.",
  networkError: "Не вдалось зв'язатися із сервером. Перевір інтернет — Hammy чекає.",

  inboxEmptyTitle: "Щоки порожні",
  inboxEmptyDesc: "Кинь мені щось із голови на вкладці «Записати» — і тут з'являться задачі.",

  todayEmptyTitle: "План ще не готовий",
  todayEmptyDesc: "Зайди в Задачі і сформуй план на сьогодні — я розкладу все по поличках.",

  allDoneTitle: "Щоки порожні. Все зроблено!",
  allDoneDesc: "Можна видихнути. Завтра напхаємо по новій.",
} as const;
