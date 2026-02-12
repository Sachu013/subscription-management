# Personal Online Subscription Management System (Payment-Centric Refactor)

This system tracks your online subscriptions using a **Payment-Centric Model**. Unlike traditional systems that rely on predicted renewal dates, this platform calculates your subscription status and lifecycle based on **actual payment records**. 

### Key Features:
- **Dynamic Status Logic**: Subscriptions are `ACTIVE` only if they have a valid payment record for the current period. Otherwise, they are `EXPIRED`.
- **Manual "Pay Now" Action**: Users record concrete payments to maintain active status and track actual spending.
- **Accurate Analytics**: Spending metrics reflect real money spent, not just projected costs.
- **Local Dashboard Alerts**: Renewal alerts are calculated locally for real-time accuracy.
