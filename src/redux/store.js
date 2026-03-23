import { legacy_createStore as createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';
import { productListReducer } from './reducers/productReducers';
import { orderListReducer } from './reducers/orderReducers';
import { reviewReducer } from './reducers/reviewReducers';

const rootReducer = combineReducers({
  productList: productListReducer,
  orderList: orderListReducer,
  reviewState: reviewReducer
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
