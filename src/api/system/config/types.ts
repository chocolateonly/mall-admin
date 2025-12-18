/**
 * 配置分页查询对象
 */
export interface ConfigQuery extends PageQuery {
  /**
   * 配置名称
   */
  configName?: string;
  /**
   * 配置键
   */
  configKey?: string;
}

/**
 * 配置分页视图对象
 */
export interface ConfigPageVO {
  /**
   * 配置ID
   */
  id: number;
  /**
   * 配置名称
   */
  configName: string;
  /**
   * 配置键
   */
  configKey: string;
  /**
   * 配置值
   */
  configValue: string;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 创建人ID
   */
  createBy: number;
  /**
   * 创建时间
   */
  createTime: string;
  /**
   * 更新人ID
   */
  updateBy: number;
  /**
   * 更新时间
   */
  updateTime: string;
}

/**
 * 配置分页结果
 */
export type ConfigPageResult = PageResult<ConfigPageVO[]>;

/**
 * 配置表单对象
 */
export interface ConfigForm {
  /**
   * 配置ID
   */
  id?: number;
  /**
   * 配置名称
   */
  configName: string;
  /**
   * 配置键
   */
  configKey: string;
  /**
   * 配置值
   */
  configValue: string;
  /**
   * 备注
   */
  remark?: string;
}