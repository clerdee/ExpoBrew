import {
  REVIEW_FETCH_REQUEST,
  REVIEW_FETCH_SUCCESS,
  REVIEW_FETCH_FAIL,
  REVIEW_SUBMIT_REQUEST,
  REVIEW_SUBMIT_SUCCESS,
  REVIEW_SUBMIT_FAIL,
  REVIEW_CLEAR
} from '../actions/reviewActions';

const initialState = {
  currentReview: null,
  loading: false,
  submitting: false,
  error: null,
  success: false
};

export const reviewReducer = (state = initialState, action) => {
  switch (action.type) {
    case REVIEW_FETCH_REQUEST:
      return { ...state, loading: true, error: null, success: false };
    case REVIEW_FETCH_SUCCESS:
      return { ...state, loading: false, currentReview: action.payload || null };
    case REVIEW_FETCH_FAIL:
      return { ...state, loading: false, error: action.payload };
    case REVIEW_SUBMIT_REQUEST:
      return { ...state, submitting: true, error: null, success: false };
    case REVIEW_SUBMIT_SUCCESS:
      return { ...state, submitting: false, currentReview: action.payload, success: true };
    case REVIEW_SUBMIT_FAIL:
      return { ...state, submitting: false, error: action.payload, success: false };
    case REVIEW_CLEAR:
      return initialState;
    default:
      return state;
  }
};
