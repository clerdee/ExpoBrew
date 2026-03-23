import { PRODUCT_LIST_REQUEST, PRODUCT_LIST_SUCCESS, PRODUCT_LIST_FAIL } from '../actions/productActions';

const initialState = {
  items: [],
  loading: false,
  error: null
};

export const productListReducer = (state = initialState, action) => {
  switch (action.type) {
    case PRODUCT_LIST_REQUEST:
      return { ...state, loading: true, error: null };
    case PRODUCT_LIST_SUCCESS:
      return { ...state, loading: false, items: action.payload };
    case PRODUCT_LIST_FAIL:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
