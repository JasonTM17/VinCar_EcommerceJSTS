# AutoNova — PRD (C001)

## Product
AutoNova is an O2O online car commerce platform: research → configure → estimate on-road cost / finance → quote → dealer test-drive → deposit order → payment → allocation → delivery.

## Actors
- Customer (storefront), Dealer staff / Sales, Admin.

## Scope
- MVP: catalog, auth/RBAC, configurator, pricing/on-road/finance, dealers, test drives, quotes, orders, mock deposit payment + signed webhook, inventory reservation, admin basics, notifications (outbox log).
- Advanced (after MVP): complex promotions, real payment provider, CRM analytics, caching.
- Out of scope: AI advisor, chatbot, trade-in, digital contracts, mobile app.

## Key rules
- Backend is source of truth for price, stock, order status. Frontend never decides payment amounts.
- Money stored as integer VND (BigInt/Decimal), never float.
- Orders snapshot price + config at confirmation; expired quotes must be re-priced.
- Double-submit / duplicate webhook must not double-create orders/payments (idempotency keys, unique provider event IDs).
- Keep DB transaction short; never hold it while waiting for a payment gateway.
