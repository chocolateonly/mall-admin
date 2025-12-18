<template>
  <div class="app-container">
    <el-card shadow="never" class="table-container">
      <el-form :model="queryParams" :inline="true" @submit.prevent>
        <el-form-item label="配置名称">
          <el-input
            v-model="queryParams.configName"
            placeholder="请输入配置名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="配置键">
          <el-input
            v-model="queryParams.configKey"
            placeholder="请输入配置键"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="search" @click="handleQuery"
            >搜索</el-button
          >
          <el-button icon="refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="mb-[10px]">
        <el-button
          type="success"
          icon="plus"
          @click="openDialog()"
          v-permission="['sys:config:add']"
          >新增</el-button
        >
        <el-button
          type="danger"
          icon="delete"
          :disabled="ids.length === 0"
          @click="handleDeleteBatch"
          v-permission="['sys:config:delete']"
          >删除</el-button
        >
        <el-button
          type="info"
          icon="refresh"
          @click="handleRefreshCache"
          v-permission="['sys:config:refresh']"
          >刷新缓存</el-button
        >
      </div>

      <el-table
        :data="pageData.list"
        v-loading="loading"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="编号" prop="id" min-width="100" />
        <el-table-column label="配置名称" prop="configName" min-width="150" />
        <el-table-column label="配置键" prop="configKey" min-width="200" />
        <el-table-column label="配置值" prop="configValue" min-width="200" />
        <el-table-column label="备注" prop="remark" min-width="200" />
        <el-table-column label="创建时间" prop="createTime" min-width="180" />
        <el-table-column label="操作" fixed="right" width="150">
          <template #default="{ row }">
            <el-button
              type="primary"
              icon="edit"
              size="small"
              link
              @click="openDialog(row.id)"
              v-permission="['sys:config:edit']"
              >编辑</el-button
            >
            <el-button
              type="primary"
              icon="delete"
              size="small"
              link
              @click="handleDelete(row.id)"
              v-permission="['sys:config:delete']"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="pageData.total > 0"
        :total="pageData.total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="handlePagination"
      />
    </el-card>

    <!-- 配置表单弹窗 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="600px"
      @close="closeDialog"
    >
      <el-form
        ref="configFormRef"
        :model="formData"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="配置名称" prop="configName">
          <el-input
            v-model="formData.configName"
            placeholder="请输入配置名称"
            maxlength="50"
          />
        </el-form-item>

        <el-form-item label="配置键" prop="configKey">
          <el-input
            v-model="formData.configKey"
            placeholder="请输入配置键"
            maxlength="50"
          />
        </el-form-item>

        <el-form-item label="配置值" prop="configValue">
          <el-input
            v-model="formData.configValue"
            placeholder="请输入配置值"
            maxlength="500"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="formData.remark"
            placeholder="请输入备注"
            maxlength="500"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
          <el-button @click="closeDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "SysConfig",
  inheritAttrs: false,
});

import {
  getConfigPage,
  getConfigForm,
  addConfig,
  updateConfig,
  deleteConfigs,
  refreshCache,
} from "@/api/system/config";

import {
  ConfigPageVO,
  ConfigForm,
  ConfigQuery,
} from "@/api/system/config/types";

const queryFormRef = ref(ElForm);
const configFormRef = ref(ElForm);

// 查询参数
const queryParams = reactive<ConfigQuery>({
  pageNum: 1,
  pageSize: 10,
  configName: undefined,
  configKey: undefined,
});

// 表单数据
const formData = reactive<ConfigForm>({
  configName: "",
  configKey: "",
  configValue: "",
  remark: "",
});

// 校验规则
const rules = {
  configName: [{ required: true, message: "请输入配置名称", trigger: "blur" }],
  configKey: [{ required: true, message: "请输入配置键", trigger: "blur" }],
  configValue: [{ required: true, message: "请输入配置值", trigger: "blur" }],
};

// 选中ID数组
const ids = ref<number[]>([]);

// 加载状态
const loading = ref(false);

// 分页数据
const pageData = reactive({
  list: [],
  total: 0,
});

// 弹窗属性
const dialog = reactive({
  title: "",
  visible: false,
});

/**
 * 查询
 */
function handleQuery() {
  loading.value = true;
  getConfigPage(queryParams)
    .then(({ data }) => {
      pageData.list = data.list;
      pageData.total = data.total;
    })
    .finally(() => (loading.value = false));
}

/**
 * 重置查询
 */
function resetQuery() {
  queryFormRef.value.resetFields();
  queryParams.pageNum = 1;
  handleQuery();
}

/**
 * 处理分页
 */
function handlePagination() {
  handleQuery();
}

/**
 * 选中数据
 */
function handleSelectionChange(selection: ConfigPageVO[]) {
  ids.value = selection.map((item) => item.id);
}

/**
 * 打开弹窗
 *
 * @param id 配置ID
 */
function openDialog(id?: number) {
  dialog.visible = true;
  if (id) {
    dialog.title = "修改配置";
    getConfigForm(id).then(({ data }) => {
      Object.assign(formData, data);
    });
  } else {
    dialog.title = "新增配置";
  }
}

/**
 * 关闭弹窗
 */
function closeDialog() {
  dialog.visible = false;
  resetForm();
}

/**
 * 重置表单
 */
function resetForm() {
  configFormRef.value.resetFields();
  configFormRef.value.clearValidate();

  formData.id = undefined;
  formData.configName = "";
  formData.configKey = "";
  formData.configValue = "";
  formData.remark = "";
}

/**
 * 提交表单
 */
function handleSubmit() {
  configFormRef.value.validate((valid: any) => {
    if (valid) {
      const id = formData.id;
      if (id) {
        updateConfig(id, formData).then(() => {
          ElMessage.success("修改成功");
          closeDialog();
          handleQuery();
        });
      } else {
        addConfig(formData).then(() => {
          ElMessage.success("新增成功");
          closeDialog();
          handleQuery();
        });
      }
    }
  });
}

/**
 * 删除配置
 */
function handleDelete(id: number) {
  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deleteConfigs(id.toString()).then(() => {
      ElMessage.success("删除成功");
      handleQuery();
    });
  });
}

/**
 * 批量删除
 */
function handleDeleteBatch() {
  if (ids.value.length === 0) {
    ElMessage.warning("请至少选择一条数据");
    return;
  }

  ElMessageBox.confirm("是否确认删除选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deleteConfigs(ids.value.join(",")).then(() => {
      ElMessage.success("删除成功");
      handleQuery();
    });
  });
}

/**
 * 刷新缓存
 */
function handleRefreshCache() {
  refreshCache().then(() => {
    ElMessage.success("刷新缓存成功");
  });
}

onMounted(() => {
  handleQuery();
});
</script>
