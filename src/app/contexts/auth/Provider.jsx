import { useEffect, useReducer } from "react";
import PropTypes from "prop-types";
import isObject from "lodash/isObject";
import isString from "lodash/isString";

import API from "utils/api";
import { isTokenValid, setSession } from "utils/jwt";
import { AuthContext } from "./context"; // <-- Comes from createSafeContext

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  errorMessage: null,
  otpToken: null,
  user: null,
};

const reducerHandlers = {
  INITIALIZE: (state, action) => ({
    ...state,
    isAuthenticated: action.payload.isAuthenticated,
    isInitialized: true,
    user: action.payload.user,
  }),

  LOGIN_REQUEST: (state) => ({
    ...state,
    isLoading: true,
    errorMessage: null,
  }),

  LOGIN_SUCCESS: (state, action) => ({
    ...state,
    isLoading: false,
    otpToken: action.payload.otpToken,
  }),

  OTP_VERIFY_SUCCESS: (state, action) => ({
    ...state,
    isAuthenticated: true,
    user: action.payload.user,
    isLoading: false,
    otpToken: null,
  }),

  LOGIN_ERROR: (state, action) => ({
    ...state,
    isLoading: false,
    errorMessage: action.payload.errorMessage,
  }),

  LOGOUT: (state) => ({
    ...state,
    ...initialState,
    isInitialized: true,
  }),
};

const reducer = (state, action) => {
  const handler = reducerHandlers[action.type];
  return handler ? handler(state, action) : state;
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Initialize on first load
  useEffect(() => {
    const init = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (token && user && isTokenValid(token)) {
        dispatch({
          type: "INITIALIZE",
          payload: {
            isAuthenticated: true,
            user: JSON.parse(user),
          },
        });
      } else {
        dispatch({
          type: "INITIALIZE",
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };

    init();
  }, []);

  // Login handler (returns otpToken)
  const login = async ({ email, password }) => {
    dispatch({ type: "LOGIN_REQUEST" });

    try {
      const response = await API.post("/auth/login", { email, password });
      const { otp_token } = response.data;

      if (!isString(otp_token)) {
        throw new Error("Invalid response: missing OTP token");
      }

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { otpToken: otp_token },
      });

      return { otpToken: otp_token };
    } catch (err) {
      dispatch({
        type: "LOGIN_ERROR",
        payload: {
          errorMessage: err?.response?.data?.message || "Login failed",
        },
      });
      throw err;
    }
  };

  // OTP verification for login
  const verifyOtp = async ({ otp, type, otp_token }) => {
    dispatch({ type: "LOGIN_REQUEST" });

    try {
      const response = await API.post("/auth/verify-otp", {
        otp,
        type,
        otp_token,
      });

      const { access_token, refresh_token, user } = response.data;

      if (!isString(access_token) || !isObject(user)) {
        throw new Error("Invalid OTP response");
      }

      setSession(access_token, refresh_token);
      localStorage.setItem("user", JSON.stringify(user));

      dispatch({
        type: "OTP_VERIFY_SUCCESS",
        payload: { user },
      });
    } catch (err) {
      dispatch({
        type: "LOGIN_ERROR",
        payload: {
          errorMessage:
              err?.response?.data?.message || "OTP verification failed",
        },
      });
      throw err;
    }
  };

  const logout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setSession(null);
      dispatch({ type: "LOGOUT" });
      window.location.href = "/login";
    }
  };

  return (
      <AuthContext value={{ ...state, login, verifyOtp, logout }}>
        {children}
      </AuthContext>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
