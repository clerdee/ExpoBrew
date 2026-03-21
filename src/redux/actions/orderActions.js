import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from '../../configs/config';

export const ORDER_LIST_REQUEST = 'ORDER_LIST_REQUEST';
export const ORDER_LIST_SUCCESS = 'ORDER_LIST_SUCCESS';
export const ORDER_LIST_FAIL = 'ORDER_LIST_FAIL';

export const fetchOrders = () => async (dispatch) => {
  try {
    dispatch({ type: ORDER_LIST_REQUEST });
    const token = await SecureStore.getItemAsync('userToken');

    if (!token) {
      dispatch({ type: ORDER_LIST_SUCCESS, payload: [] });
      return;
    }

    const { data } = await axios.get(`${API_BASE_URL}/orders/myorders`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    dispatch({ type: ORDER_LIST_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: ORDER_LIST_FAIL,
      payload: error.response?.data?.message || 'Failed to fetch orders.'
    });
  }
};
