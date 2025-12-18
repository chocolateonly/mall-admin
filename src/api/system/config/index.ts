import request from "@/utils/request";
import { AxiosPromise } from "axios";
import { ConfigPageResult, ConfigQuery, ConfigForm } from "./types";

/**
 * 获取配置分页列表
 *
 * @param queryParams
 */
export function getConfigPage(
  queryParams: ConfigQuery
): AxiosPromise<ConfigPageResult> {
  return request({
    url: "/mall-system/app-api/v1/configs/page",
    method: "get",
    params: queryParams,
  });
}

/**
 * 获取配置表单数据
 *
 * @param id
 */
export function getConfigForm(id: number): AxiosPromise<ConfigForm> {
  return request({
    url: "/mall-system/app-api/v1/configs/" + id + "/form",
    method: "get",
  });
}

/**
 * 新增配置
 *
 * @param data
 */
export function addConfig(data: ConfigForm) {
  return request({
    url: "/mall-system/app-api/v1/configs",
    method: "post",
    data: data,
  });
}

/**
 * 修改配置
 *
 * @param id
 * @param data
 */
export function updateConfig(id: number, data: ConfigForm) {
  return request({
    url: "/mall-system/app-api/v1/configs/" + id,
    method: "put",
    data: data,
  });
}

/**
 * 删除配置
 *
 * @param ids
 */
export function deleteConfigs(ids: string) {
  return request({
    url: "/mall-system/app-api/v1/configs/" + ids,
    method: "delete",
  });
}

/**
 * 刷新配置缓存
 */
export function refreshCache() {
  return request({
    url: "/mall-system/app-api/v1/configs/refresh",
    method: "put",
  });
}