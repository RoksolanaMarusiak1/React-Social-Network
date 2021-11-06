import { stopSubmit } from 'redux-form';
import { AuthAPI, SecurityAPI } from '../api/api';

const SET_USER_DATA = 'auth/SET_USER_DATA';
const GET_CAPTCHA_URL_SUCCESS = 'GET_CAPTCHA_URL_SUCCESS';

let initialState = {
  userId: null,
  email: null,
  login: null,
  isAuth: false,
  captchaUrl: null
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_DATA:
    case GET_CAPTCHA_URL_SUCCESS:
      return {
        ...state,
        ...action.data
      }
    default:
      return state;
  }
};

export const setAuthUserData = (userId, email, login, isAuth) => {
  return ({ type: SET_USER_DATA, data: { userId, email, login, isAuth } })
};

export const getCaptchaUrlSuccess = (captchaUrl) => {
  return ({ type: GET_CAPTCHA_URL_SUCCESS, data: { captchaUrl } })
};


export const getAuthUserData = () => async (dispatch) => {
  let response = await AuthAPI.getAuthData();
  if (response.data.resultCode === 0) {
    let { id, email, login } = response.data.data;
    dispatch(setAuthUserData(id, email, login, true));
  }
};

export const login = (email, password, rememberMe = false, captcha = null) => async (dispatch) => {
  let response = await AuthAPI.login(email, password, rememberMe, captcha)
  if (response.data.resultCode === 0) {
    dispatch(getAuthUserData());
  } else {
    if (response.data.resultCode === 10) {
      dispatch(getCaptchaUrl());
    }
    let message = response.data.messages.length > 0 ? response.data.messages[0] : "Some error";
    dispatch(stopSubmit("login", { _error: message }));
  }
};

export const getCaptchaUrl = () => async (dispatch) => {
  let response = await SecurityAPI.getCaptchaUrl();
  let captchaUrl = response.data.url;
  dispatch(getCaptchaUrlSuccess(captchaUrl));
};

export const logout = () => async (dispatch) => {
  let response = await AuthAPI.logout()
  if (response.data.resultCode === 0) {
    dispatch(setAuthUserData(null, null, null, false));
  }
};

export default authReducer;