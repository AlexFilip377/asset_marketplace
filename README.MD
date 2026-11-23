# GameInsight — Decentralized Game Asset Marketplace on Solana

Децентрализованный маркетплейс игровых ассетов (3D-модели, спрайты, звуковые эффекты, музыка, UI-киты, окружение и анимации), реализованный на блокчейне **Solana**[cite: 1, 10]. Проект разработан в рамках дисциплины «ИТ-стартап Итоговый проект 1» (AlmaU).

## Основные возможности

- **Токенизация ассетов (SPL Tokens):** при публикации нового ассета создаётся уникальный SPL-токен (`decimals = 0`), который переводится на escrow-хранилище (Vault) смарт-контракта[cite: 1, 21].
- **Децентрализованный листинг (PDA & Accounts):** информация о продавце, токене и цене в lamports хранится в детерминированном аккаунте `Listing` (Program Derived Address)[cite: 1, 20].
- **Безопасная покупка (CPI):** при покупке смарт-контракт атомарно переводит SOL продавцу через System Program и отправляет токен ассета покупателю из Vault через Token Program с подписью PDA[cite: 1, 20].
- **Веб-интерфейс (dApp):** витрина ассетов, поиск и фильтрация по категориям, избранное, корзина, личный кабинет и публикация листингов с подключением кошельков (Phantom, Solflare)[cite: 8, 13, 14, 16, 17, 18, 25].

## Технологический стек

- **Smart Contracts:** Rust, Anchor Framework (`v0.30+`), Solana SPL Token[cite: 1, 20]
- **Frontend:** React, TypeScript, Vite, React Router, Lucide Icons[cite: 7, 25, 28]
- **Web3 Integration:** `@solana/web3.js`, `@solana/spl-token`, `@coral-xyz/anchor`, Solana Wallet Adapter
- **Testing & Network:** Mocha/Chai (TypeScript), Solana Devnet[cite: 1]

## Smart Contract (Solana Devnet)

- **Program ID:** `CME9UWV8o6muidz2b7suFDbwJuxF5wWVcF6XwgLJXbNR`[cite: 19]
- **Explorer:** [Открыть в Solana Explorer (Devnet)](https://explorer.solana.com/address/CME9UWV8o6muidz2b7suFDbwJuxF5wWVcF6XwgLJXbNR?cluster=devnet)[cite: 19]
- **Live Demo:** `<https://asset-marketplace-gilt.vercel.app/>`

## Структура проекта

```text
asset_marketplace/
├── programs/
│   └── asset_marketplace/   # Исходный код программы на Rust (Anchor)
├── tests/                   # Интеграционные тесты на TypeScript
├── app/                     # Клиентское веб-приложение (React + Vite)
│   ├── src/
│   │   ├── components/      # Header, Sidebar, ProductCard
│   │   ├── pages/           # Home, Categories, Sell, Cart, Favorites, Profile, Search
│   │   ├── solana/          # Подключение к Anchor-программе, IDL и хук useMarketplace
│   │   └── state/           # Локальное состояние витрины, корзины и метаданных
│   └── vercel.json          # Конфигурация SPA-роутинга для Vercel
├── Anchor.toml              # Конфигурация Anchor
└── README.md