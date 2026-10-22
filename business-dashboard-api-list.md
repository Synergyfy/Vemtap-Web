# Business Dashboard API List

This file collects the business-dashboard API surface currently used or expected by the VEMTAP frontend.

## 1) Auth

- `POST /auth/login`
- `POST /auth/logout`

## 2) Catalogue / product management

- `GET /catalogue/items`
- `POST /catalogue/items`
- `GET /catalogue/items/:id`
- `PATCH /catalogue/items/:id`
- `GET /catalogue/items/:id/branch-pricing`
- `PUT /catalogue/items/:id/branch-pricing`

- `GET /catalogue/offers`
- `POST /catalogue/offers`
- `GET /catalogue/offers/:id`
- `PATCH /catalogue/offers/:id`
- `GET /catalogue/offers/:id/branch-pricing`
- `PUT /catalogue/offers/:id/branch-pricing`
- `GET /catalogue/offers/:id/stats`
- `GET /catalogue/offers/summary`
- `GET /catalogue/offers/admin`
- `GET /catalogue/offers/public`

## 3) Customer segments / audience targeting

- `GET /segments`
- `POST /segments`
- `GET /segments/:id`
- `PATCH /segments/:id`
- `POST /segments/preview`
- `GET /segments/criteria-options`
- `GET /segments/:id/insights`

## 4) Promotions / deals engine

- `GET /promotions`
- `POST /promotions`
- `GET /promotions/:id`
- `PATCH /promotions/:id`
- `POST /promotions/:id/launch`
- `POST /promotions/:id/pause`
- `POST /promotions/:id/resume`
- `POST /promotions/:id/end`
- `GET /promotions/:id/stats`
- `GET /promotions/summary`
- `POST /promotions/forecast`
- `GET /promotions/eligible-assets`

## 5) Boost / ad amplification

- `GET /boosts`
- `POST /boosts`
- `GET /boosts/:id`
- `PATCH /boosts/:id`
- `POST /boosts/:id/launch`
- `POST /boosts/:id/pause`
- `POST /boosts/:id/resume`
- `POST /boosts/:id/end`
- `GET /boosts/:id/stats`
- `GET /boosts/options`
- `POST /boosts/forecast`

## 6) Ad wallet / payments

- `GET /ad-wallet`
- `GET /ad-wallet/transactions`
- `GET /ad-wallet/prepacks`
- `POST /ad-wallet/top-up`
- `GET /ad-wallet/invoices/:id`

## 7) Orders / transactions

- `GET /orders`
- `POST /orders`
- `GET /orders/:id`
- `PATCH /orders/:id/status`
- `PATCH /orders/:id/payment`

## 8) Claims / voucher claims

- `GET /claims`
- `POST /claims`
- `GET /claims/:id`

## 9) Notifications

- `GET /notifications`
- `GET /notifications/unread-count`
- `GET /notifications/preferences`
- `PATCH /notifications/preferences`
- `POST /notifications/push-token`
- `DELETE /notifications/push-token`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/mark-all-read`

## 10) Business dashboard coverage

These endpoints align with the main dashboard modules:

- Overview / analytics
- Catalog / products / offers
- Promotions / deals
- Boosts / ads
- Wallet / payouts
- Orders / fulfillment
- Customer segments
- Notifications / alerts

## Notes

- This is intended as a frontend contract checklist for the business dashboard.
- The source of truth should remain the backend contract and live API responses.
- Any endpoint not implemented by the backend should be removed from the frontend contract list.
