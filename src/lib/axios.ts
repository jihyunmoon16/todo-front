import axios from "axios";
import { jwtDecode } from "jwt-decode";

const instance = axios.create({
  baseURL: "http://localhost:8080",
});

// 요청 인터셉터: 모든 요청에 JWT 토큰 자동 첨부 및 만료 체크
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // exp는 초 단위, Date.now()는 ms 단위
        if (decoded && typeof decoded === 'object' && 'exp' in decoded) {
          const exp = (decoded as any).exp;
          if (typeof exp === 'number' && exp * 1000 < Date.now()) {
            // 토큰 만료됨
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
            return Promise.reject(new Error("Token expired"));
          }
        }
      } catch (e) {
        // 토큰 파싱 실패 시 강제 로그아웃
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(new Error("Invalid token"));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 에러 시 로그인 페이지로 리다이렉트
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default instance; 