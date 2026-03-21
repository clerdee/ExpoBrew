import { ORDER_LIST_REQUEST, ORDER_LIST_SUCCESS, ORDER_LIST_FAIL } from '../actions/orderActions';

const initialState = {
  items: [],
  loading: false,
  error: null
};

export const orderListReducer = (state = initialState, action) => {
  switch (action.type) {
    case ORDER_LIST_REQUEST:
      return { ...state, loading: true, error: null };
    case ORDER_LIST_SUCCESS:
      return { ...state, loading: false, items: action.payload };
    case ORDER_LIST_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
