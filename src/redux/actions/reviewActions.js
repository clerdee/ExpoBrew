import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../configs/config';

export const REVIEW_FETCH_REQUEST = 'REVIEW_FETCH_REQUEST';
export const REVIEW_FETCH_SUCCESS = 'REVIEW_FETCH_SUCCESS';
export const REVIEW_FETCH_FAIL = 'REVIEW_FETCH_FAIL';
export const REVIEW_SUBMIT_REQUEST = 'REVIEW_SUBMIT_REQUEST';
export const REVIEW_SUBMIT_SUCCESS = 'REVIEW_SUBMIT_SUCCESS';
export const REVIEW_SUBMIT_FAIL = 'REVIEW_SUBMIT_FAIL';
export const REVIEW_CLEAR = 'REVIEW_CLEAR';

export const clearReviewState = () => ({ type: REVIEW_CLEAR });

export const fetchMyReview = (orderId, productId) => async (dispatch) => {
  try {
    dispatch({ type: REVIEW_FETCH_REQUEST });
    const token = await SecureStore.getItemAsync('userToken');
    const { data } = await axios.get(`${API_BASE_URL}/reviews/my-review`, {
      params: { orderId, productId },
      headers: { Authorization: `Bearer ${token}` }
    });
    dispatch({ type: REVIEW_FETCH_SUCCESS, payload: data });
    return data;
  } catch (error) {
    const message = error.response?.data?.message || 'Could not load your review.';
    dispatch({ type: REVIEW_FETCH_FAIL, payload: message });
    throw new Error(message);
  }
};

export const submitReview = ({ productId, orderId, rating, comment, reviewId }) => async (dispatch) => {
  try {
    dispatch({ type: REVIEW_SUBMIT_REQUEST });
    const token = await SecureStore.getItemAsync('userToken');
    let data;

    if (reviewId) {
      ({ data } = await axios.put(`${API_BASE_URL}/reviews/${reviewId}`, { rating, comment }, {
        headers: { Authorization: `Bearer ${token}` }
      }));
    } else {
      ({ data } = await axios.post(`${API_BASE_URL}/products/${productId}/reviews`, { orderId, rating, comment }, {
        headers: { Authorization: `Bearer ${token}` }
      }));
    }

    dispatch({ type: REVIEW_SUBMIT_SUCCESS, payload: data });
    return data;
  } catch (error) {
    const message = error.response?.data?.message || 'Could not submit your review.';
    dispatch({ type: REVIEW_SUBMIT_FAIL, payload: message });
    throw new Error(message);
  }
};
