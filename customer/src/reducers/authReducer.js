// Trạng thái ban đầu cho AuthContext
export const initialState = {
  userInfo: null,
  loading: false,
  error: null,
};

// Reducer xử lý các actions liên quan đến authentication
export const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOGIN_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'USER_LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        userInfo: action.payload,
        error: null,
      };
    case 'USER_LOGIN_FAIL':
      return {
        ...state,
        loading: false,
        userInfo: null,
        error: action.payload,
      };
    case 'USER_LOGOUT':
      return {
        ...state,
        userInfo: null,
        error: null,
      };
    case 'USER_UPDATE_PROFILE':
      return {
        ...state,
        userInfo: {
          ...state.userInfo,
          ...action.payload,
        },
      };
    default:
      return state;
  }
}; 