import request from "@/utils/request";
import { AxiosPromise } from "axios";
import { CaptchaResult, LoginData, LoginResult } from "./types";

/**
 * 登录API
 *
 * @param data {LoginData}
 * @returns
 */
export function loginApi(data: LoginData): AxiosPromise<LoginResult> {
  // 使用JSON格式而不是FormData
  return request({
    url: "/youlai-auth/oauth2/token",
    method: "post",
    data: {
      username: data.username,
      password: data.password,
      captchaId: data.captchaId,
      captchaCode: data.captchaCode,
      // grant_type: "password"
    },
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic bWFsbC1hZG1pbjoxMjM0NTY=", // 客户端信息Base64明文：mall-admin:123456
    },
  });
}

/**
 * 获取验证码
 */
export function getCaptchaApi(): AxiosPromise<CaptchaResult> {
  return request({
    url: "/youlai-auth/api/v1/auth/captcha",
    method: "get",
  });
}

/**
 * 注销API
 */
export function logoutApi() {
  return request({
    url: "/youlai-auth/api/v1/users/logout",
    method: "delete",
  });
}