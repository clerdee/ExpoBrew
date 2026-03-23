# ExpoBrew system audit and requirement gap analysis

## 1. What the system currently is

ExpoBrew is a React Native + Expo mobile app with a Node.js/Express + MongoDB backend.

### Frontend structure
- `App.js` selects the initial navigator based on the `userToken` and `userInfo` saved in Expo Secure Store.
- Customer flows live in `src/Navigators/UserStackNavigator.js` and use a bottom-tab layout for Home, Orders, Stores, Favorites, and Profile.
- Admin flows live in `src/Navigators/AdminStackNavigator.js` and use a drawer sidebar for Dashboard, Products, Users, Orders, and Promos.
- Authentication screens live in `src/screens/Auth/*`.

### Backend structure
- `backend/server.js` mounts route groups for auth, products, users, orders, and admin.
- JWT auth is implemented in `backend/middleware/authMiddleware.js`.
- MongoDB models currently exist for `User`, `Product`, `Order`, `Notification`, and `Promo`.

## 2. Features that are already implemented

### Product / service CRUD
Implemented for **products** only.
- Admin product CRUD exists in `backend/routes/productRoutes.js` and `backend/controllers/productController.js`.
- Product images are uploaded through Cloudinary using multer in `backend/routes/productRoutes.js`.
- Admin UI for add/edit/delete exists in `src/screens/Admin/Products.js` and `src/components/admin/AddProduct.js`.
- Camera/gallery image picking is already used in `src/components/admin/AddProduct.js`.

### User functions
Partially implemented.
- Email/password registration with OTP email verification exists in `backend/controllers/authController.js` and `src/screens/Auth/RegisterPage.js`.
- Login exists in `backend/controllers/authController.js` and `src/screens/Auth/LoginPage.js`.
- Registration supports profile photo upload from gallery or camera in `src/screens/Auth/RegisterPage.js`.
- JWT is stored in Expo Secure Store in `src/screens/Auth/LoginPage.js`.

### Cart persistence
Partially implemented and actually uses SQLite already.
- Cart data is stored in SQLite in `src/screens/Customer/HomePage.js` and `src/screens/Customer/FavoritesPage.js`.
- Cart items are loaded again when the app opens.
- Checkout clears the in-memory cart through `clearCart()` in `src/components/CartModal.js` → `src/screens/Customer/PlaceOrderPage.js`.

### Transactions / orders
Partially implemented.
- Customers can create orders in `backend/controllers/orderController.js` through `POST /api/orders`.
- Customers can view their own orders in `GET /api/orders/myorders`.
- Admin can list all orders and update status in `GET /api/orders` and `PUT /api/orders/:id/status`.
- Admin UI for order management exists in `src/screens/Admin/Orders.js` and `src/components/admin/OrderDetail.js`.

### Promotions / notifications
Partially implemented.
- Admin can create promo records in `backend/controllers/adminController.js`.
- Creating a promo creates a `Notification` document for all users (`user: null`).
- Notification inbox UI exists in `src/screens/Customer/NotificationPage.js`.
- Header badge count pulls unread notifications in `src/components/Header.js`.

### Search / filters
Partially implemented.
- Admin product search + category/stock filtering exists in `src/screens/Admin/Products.js`.
- Admin order search + status/date filtering exists in `src/screens/Admin/Orders.js`.
- Favorites search exists in `src/screens/Customer/FavoritesPage.js`.
- Customer home currently filters by category only in `src/screens/Customer/HomePage.js`.

### Admin UI with drawer/sidebar
Implemented.
- The admin side uses a drawer navigator in `src/Navigators/AdminStackNavigator.js`.

## 3. Major requirement gaps by your class checklist

### mp1 Product/service CRUD
**Status: PARTIALLY DONE**
- Product CRUD is done.
- Service CRUD does **not** exist.
- Photo upload / camera support exists for products.

### mp2 User functions
**Status: PARTIALLY DONE**
- Login and registration are done.
- Profile photo capture/upload is partly done in registration and local profile UI.
- Profile update screen exists, but it does **not** save changes to the backend yet.
- Google/Facebook login UI buttons exist, but there is no real OAuth implementation.

### mp3 Review ratings
**Status: NOT DONE**
Missing completely:
- No `Review` model.
- No review routes/controllers.
- No verified-purchase validation.
- No user review create/update UI.
- No rating aggregation on products.

### mp4 SQLite cart
**Status: MOSTLY DONE, BUT NEEDS FIXING**
- SQLite persistence exists.
- Cart loads on app open.
- Cart is intended to clear after checkout.
- Risk: only customer Home and Favorites write/read SQLite; checkout cleanup should also delete/update the SQLite row directly for consistency.

### Term test transaction
**Status: PARTIALLY DONE**
- Completed transaction flow: mostly done through order creation + status updates.
- Update transaction status: done.
- Send push notification after update: **not done**. Current code only writes a MongoDB notification document.
- Click notification to view order details: **broken/incomplete**. `NotificationPage` navigates to `OrderDetail`, but customer navigator does not register a customer order-detail screen.

### Quiz 1 search/filters
**Status: NOT DONE FOR CUSTOMER PRODUCT SEARCH**
- There is no real customer product search on the main product list.
- There is no customer price-range filter.
- There is no combined customer category + price-range search UI for products/services.

### Quiz 2 notifications
**Status: PARTIALLY DONE**
- Promo notifications are stored and listed.
- Viewing promo details exists through `PromoList` / `PromoDetail`.
- Real push notifications are not implemented.

### Quiz 3 Redux on order, product, review functions
**Status: NOT DONE**
- `react-redux` and `redux-thunk` are installed.
- No Redux store, reducers, slices, actions, or provider usage exists in the app.

### Unit 1 user interface with drawer (admin end sidebar)
**Status: DONE**
- Implemented in admin drawer navigator.

### Unit 2 node backend, JWT tokens stored on SQLite or expo secure store, push token saved on user model
**Status: PARTIALLY DONE**
- Node backend exists.
- JWT is stored in Expo Secure Store.
- Push token is **not** stored on the user model.
- There is no stale push-token cleanup.
- There is no backend endpoint to register/unregister push tokens.

## 4. Important code issues you should fix before claiming requirements are complete

### A. Profile update is fake right now
`src/Shared/ProfilePage.js` shows an editable profile form, but `handleUpdateProfile()` only waits with `setTimeout` and shows success. There is no API call and no backend route/controller to save profile changes.

### B. Admin user deactivation is broken
`src/screens/Admin/Users.js` calls `PUT /users/:id/deactivate`, but that route does not exist in `backend/routes/userRoutes.js`.

### C. Order creation relies on fields required by schema, but controller omits them
`backend/models/Order.js` requires `shippingAddress` and `paymentMethod`, but `backend/controllers/orderController.js` only extracts `orderItems` and `totalPrice`. This can cause order creation failures or inconsistent saves.

### D. Notifications are in-app only, not push notifications
The code creates `Notification` documents in MongoDB, but there is no `expo-notifications`, no device token registration, and no push send logic.

### E. Customer notification deep-link is incomplete
`src/screens/Customer/NotificationPage.js` navigates to `OrderDetail`, but the customer navigator does not define that screen.

### F. Customer search/filter requirement is not satisfied
Customer home only supports category filtering. There is no searchbar, no price range filter, and no category+price combined search UI for products.

### G. Social login is only a visual placeholder
Google and Facebook buttons in `src/screens/Auth/RegisterPage.js` have no handler logic.

### H. Redux is not applied at all
Dependencies are installed, but state is still handled locally with `useState`, `useEffect`, axios calls, and SecureStore directly.

### I. User model is missing fields already assumed by UI
The profile screen reads `phone`, `birthday`, and `address`, but `backend/models/User.js` does not define those fields.

### J. Config is hard-coded to one LAN IP
`src/configs/config.js` hardcodes `192.168.1.17`, so the app will break on a different network or device.

## 5. Best requirement-completion plan (recommended order)

### Phase 1 — Fix core broken paths first
1. Fix `Order` creation so `shippingAddress` and `paymentMethod` are saved correctly.
2. Add backend user profile update endpoint.
3. Extend `User` model with `phone`, `birthday`, `address`, and push token field(s).
4. Update `ProfilePage` to call the backend and persist profile changes.
5. Fix admin user deactivation or replace it with delete/disable logic that actually exists.

### Phase 2 — Finish class requirements with biggest grade impact
1. Implement **reviews/ratings** end-to-end.
2. Implement **customer product search + price/category filters**.
3. Implement **Redux** for products, orders, and reviews.
4. Implement **real push notifications** using Expo push tokens.

### Phase 3 — Finish optional/advanced items
1. Social login with Google.
2. Social login with Facebook.
3. Better checkout/cart SQLite cleanup.
4. Service CRUD if your instructor really expects both products and services separately.

## 6. Minimum new backend pieces you still need

### Models to add
- `Review`
- optionally `Service` if products and services must be separate

### User model changes
Add fields like:
- `phone`
- `birthday`
- `address`
- `expoPushToken` or `pushTokens: []`
- maybe `isActive`

### Routes/controllers to add
- `PUT /api/users/profile`
- `POST /api/users/push-token`
- `DELETE /api/users/push-token`
- `POST /api/products/:id/reviews`
- `PUT /api/reviews/:id`
- `GET /api/products?search=&category=&minPrice=&maxPrice=`
- if needed: service CRUD endpoints

## 7. Minimum new frontend pieces you still need

- Customer searchbar and filter modal on `HomePage`.
- Review list + add/edit review form on product/order flow.
- Redux store/provider and slices for product/order/review.
- Real notification registration and handlers.
- Customer order detail screen for tapping an order notification.
- Real profile update submission with image upload support.

## 8. If your goal is to pass fastest

If you want the fastest path to satisfy the grading sheet, I recommend implementing in this exact order:
1. Real profile update.
2. Fix order create/update consistency.
3. Customer search + category + price range filter.
4. Review/rating model + APIs + UI.
5. Redux for products/orders/reviews.
6. Expo push notifications with tap-to-open order details.
7. Social login only if still required after the higher-value items are stable.

