# AutoNova — PRD (C001)

## Product
AutoNova is an O2O online car commerce platform: research → configure → estimate on-road cost / finance → quote → dealer test-drive → deposit order → payment → allocation → delivery.

## Actors
- Customer (storefront), Dealer staff / Sales, Admin.

## Scope
- MVP: catalog, auth/RBAC, configurator, pricing/on-road/finance, dealers, test drives, quotes, orders, mock deposit payment + signed webhook, inventory reservation, admin basics, notifications (outbox log), and one-shot catalog-grounded vehicle recommendations.
- Advanced (after MVP): complex promotions, real payment provider, CRM analytics, caching.
- The recommender sends one natural-language need to LongCat to extract bounded constraints; the API validates them and filters/ranks only published vehicle models and their trims from PostgreSQL. Returned facts and reason codes come from database comparisons. The feature stores no conversation history and does not imply live stock.
- Out of scope: conversational AI advisor/chatbot, market or price forecasting, trade-in, digital contracts, mobile app.

## Key rules
- Backend is source of truth for price, stock, order status. Frontend never decides payment amounts.
- Money stored as integer VND (BigInt/Decimal), never float.
- Orders snapshot price + config at confirmation; expired quotes must be re-priced.
- Double-submit / duplicate webhook must not double-create orders/payments (idempotency keys, unique provider event IDs).
- Keep DB transaction short; never hold it while waiting for a payment gateway.
