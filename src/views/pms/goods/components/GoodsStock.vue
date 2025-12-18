<template>
  <div class="component-container">
    <div class="component-container__main">
      <el-card class="box-card">
        <template #header>
          <span>商品规格</span>
          <el-button
            type="success"
            size="small"
            class="float-right"
            @click="handleSpecAdd"
          >
            <i-ep-plus /> 添加规格项
          </el-button>
        </template>

        <el-form
          ref="specFormRef"
          :model="specForm"
          :inline="true"
          size="small"
        >
          <el-table
            ref="specTableRef"
            :data="specForm.specList"
            row-key="id"
            size="small"
          >
            <el-table-column align="center" width="50">
              <template #default>
                <svg-icon class="drag-handler" icon-class="drag" />
              </template>
            </el-table-column>
            <el-table-column label="规格名" width="200">
              <template #default="scope">
                <el-form-item
                  :prop="'specList[' + scope.$index + '].name'"
                  :rules="rules.spec.name"
                >
                  <el-input
                    v-model="scope.row.name"
                    type="text"
                    size="small"
                    @input="handleSpecChange()"
                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column>
              <template #header>
                规格值
                <el-link
                  type="danger"
                  style="font-size: 12px"
                  :underline="false"
                  >（默认第一条规格包含图片）</el-link
                >
              </template>

              <template #default="scope">
                <div
                  v-for="item in scope.row.values"
                  :key="item.id"
                  style="display: inline-block; margin-right: 15px"
                >
                  <el-tag
                    size="small"
                    closable
                    :type="colors[scope.$index % colors.length] as any"
                    @close="handleSpecValueRemove(scope.$index, item.id)"
                  >
                    {{ item.value }}
                  </el-tag>
                  <single-upload
                    v-if="scope.$index == 0"
                    v-model="item.picUrl"
                    style="margin-top: 5px"
                  />
                </div>

                <el-input
                  v-if="tagInputs.length > 0 && tagInputs[scope.$index].visible"
                  v-model="tagInputs[scope.$index].value"
                  style="width: 80px; vertical-align: top"
                  size="small"
                  @keyup.enter="handleSpecValueInput(scope.$index)"
                  @blur="handleSpecValueInput(scope.$index)"
                />
                <el-button
                  v-else
                  style="vertical-align: top"
                  size="small"
                  @click="handleSpecValueAdd(scope.$index)"
                >
                  <i-ep-plus /> 添加规格值
                </el-button>
              </template>
            </el-table-column>

            <el-table-column width="60" label="操作">
              <template #default="scope">
                <el-button
                  type="danger"
                  size="small"
                  circle
                  plain
                  @click.stop="handleSpecRemove(scope.$index)"
                  ><i-ep-minus />
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-form>
      </el-card>

      <el-card class="box-card">
        <template #header>
          <span>商品库存</span>
        </template>
        <el-form ref="skuFormRef" :model="skuForm" size="small" :inline="true">
          <el-table
            :data="skuForm.skuList"
            :span-method="objectSpanMethod as any"
            highlight-current-row
            size="small"
            border
          >
            <el-table-column
              v-for="(title, index) in specTitles"
              :key="index"
              align="center"
              :prop="'specValue' + (index + 1)"
              :label="title"
            />

            <el-table-column label="商品编码" align="center">
              <template #default="scope">
                <el-form-item
                  :prop="'skuList[' + scope.$index + '].skuSn'"
                  :rules="rules.sku.skuSn"
                >
                  <el-input v-model="scope.row.skuSn" />
                </el-form-item>
              </template>
            </el-table-column>

            <el-table-column label="价格" align="center">
              <template #default="scope">
                <el-form-item
                  :prop="'skuList[' + scope.$index + '].price'"
                  :rules="rules.sku.price"
                >
                  <el-input v-model="scope.row.price" />
                </el-form-item>
              </template>
            </el-table-column>

            <el-table-column label="库存" align="center">
              <template #default="scope">
                <el-form-item
                  :prop="'skuList[' + scope.$index + '].stock'"
                  :rules="rules.sku.stock"
                >
                  <el-input v-model="scope.row.stock" />
                </el-form-item>
              </template>
            </el-table-column>
          </el-table>
        </el-form>
      </el-card>
    </div>
    <div class="component-container__footer">
      <el-button @click="handlePrev">上一步，设置商品属性</el-button>
      <el-button type="primary" @click="submitForm">提交</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
// API 引用
import { getAttributeList } from "@/api/pms/attribute";
import { addSpu, updateSpu } from "@/api/pms/goods";
import { useRouter } from "vue-router";

const emit = defineEmits(["prev", "next", "update:modelValue"]);

const router = useRouter();

const specFormRef = ref(ElForm);
const skuFormRef = ref(ElForm);

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => {
      return {};
    },
  },
});

const goodsInfo: any = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit("update:modelValue", value);
  },
});

const state = reactive({
  specForm: {
    specList: [] as any[],
  },
  skuForm: {
    skuList: [] as any[],
  },
  // 规格项表格标题
  specTitles: [] as any[],
  rules: {
    spec: {
      name: [{ required: true, message: "请输入规格名称", trigger: "blur" }],
      value: [{ required: true, message: "请输入规格值", trigger: "blur" }],
    },
    sku: {
      skuSn: [{ required: true, message: "请输入商品编号", trigger: "blur" }],
      price: [{ required: true, message: "请输入商品价格", trigger: "blur" }],
      stock: [{ required: true, message: "请输入商品库存", trigger: "blur" }],
    },
  },
  colors: ["", "success", "warning", "danger"],
  tagInputs: [{ value: undefined, visible: false }], // 规格值标签临时值和显隐控制
});

const { specForm, skuForm, specTitles, rules, colors, tagInputs } =
  toRefs(state);

watch(
  () => goodsInfo.value,
  (newVal, oldVal) => {
    // 当商品信息发生变化时重新加载数据
    if (newVal && newVal.specList) {
      loadData();
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

watch(
  () => goodsInfo.value.categoryId,
  (newVal) => {
    // 商品编辑不加载分类下的规格
    const goodsId = goodsInfo.value.id;
    if (goodsId) {
      return false;
    }
    if (newVal) {
      // type=1 商品分类下的规格
      getAttributeList({ categoryId: newVal, type: 1 }).then((response) => {
        const specList = response.data;
        if (specList && specList.length > 0) {
          specList.forEach((item: any) => {
            state.specForm.specList.push({
              name: item.name,
              values: [],
            });
          });
          loadData();
        }
      });
    }
  },
  {
    immediate: true,
    deep: true,
  }
);

watch(
  state.specForm.specList,
  () => {
    generateSkuList();
  },
  { deep: true }
);

function loadData() {
  // 清空现有数据
  state.specForm.specList = [];

  if (goodsInfo.value.specList && goodsInfo.value.specList.length > 0) {
    goodsInfo.value.specList.forEach((specItem: any) => {
      state.specForm.specList.push({
        name: specItem.name || "",
        values: specItem.values
          ? specItem.values.map((val: any) => ({
              id: val.id !== undefined ? val.id : undefined,
              value: val.value || "",
              picUrl: val.picUrl || "",
            }))
          : [],
      });
    });
  }

  // 每个规格项追加一个添加规格值按钮
  // 确保 tagInputs 与 specForm.specList 的长度一致
  while (state.tagInputs.length < state.specForm.specList.length) {
    state.tagInputs.push({ value: undefined, visible: false });
  }

  while (state.tagInputs.length > state.specForm.specList.length) {
    state.tagInputs.pop();
  }

  // SKU规格ID拼接字符串处理
  if (goodsInfo.value.skuList && goodsInfo.value.skuList.length > 0) {
    goodsInfo.value.skuList.forEach((sku: any) => {
      // 如果specIdArr不存在，从specIds创建
      if (!sku.specIdArr && sku.specIds) {
        sku.specIdArr = sku.specIds.split("_");
      }
      // 确保specIdArr始终存在
      if (!sku.specIdArr) {
        sku.specIdArr = [];
      }
    });
  } else {
    goodsInfo.value.skuList = [];
  }

  // 确保specForm.specList中的每一项都有values属性
  state.specForm.specList.forEach((item: any) => {
    if (!item.values) {
      item.values = [];
    }
  });

  generateSkuList();
  handleSpecChange();
  handleSpecReorder();
}

/**
 * 生成SKU列表的title
 */
function handleSpecChange() {
  // 确保 specForm.specList 存在且是数组
  if (state.specForm.specList && Array.isArray(state.specForm.specList)) {
    const specList = JSON.parse(JSON.stringify(state.specForm.specList));
    state.specTitles = specList.map((item: any) => item.name || "");
  } else {
    state.specTitles = [];
  }
}

/**
 * 规格列表重排序
 */
function handleSpecReorder() {
  // 确保 specForm.specList 存在且是数组
  if (state.specForm.specList && Array.isArray(state.specForm.specList)) {
    state.specForm.specList.forEach((item, index) => {
      item.index = index;
    });
  }
}

/**
 *  根据商品规格笛卡尔积生成SKU列表
 *
 * 规格列表：
 * [
 *    { 'id':1,'name':'颜色','values':[{id:1,value:'白色'},{id:2,value:'黑色'},{id:3,value:'蓝色'}] },
 *    { 'id':2,'name':'版本','values':[{id:1,value:'6+128G'},{id:2,value:'8+128G'},{id:3,value:'8G+256G'}] }
 * ]
 */
function generateSkuList() {
  // 如果规格为空，生成SKU列表为空
  if (state.specForm.specList.length == 0) {
    state.skuForm.skuList = [];
    return;
  }

  // 过滤掉空的规格值
  const specList = JSON.parse(
    JSON.stringify(
      state.specForm.specList.filter(
        (item) => item.values && item.values.length > 0
      )
    )
  );

  // 如果过滤后没有有效的规格项，则清空SKU列表
  if (specList.length === 0) {
    state.skuForm.skuList = [];
    return;
  }

  // 使用正确的初始值避免undefined问题
  const skuList = specList.reduce((acc: any, curr: any, index: number) => {
    let result = [] as any[];
    // 如果是第一个规格项，直接创建初始对象
    if (index === 0) {
      curr.values.forEach((v: any) => {
        result.push({
          specValues: (v.value || "") + "_",
          specIds: (v.id || "") + "_",
          name: "",
          id: undefined,
          skuSn: "",
          price: 0,
          stock: 0,
        });
      });
      return result;
    }

    // 后续规格项进行笛卡尔积运算
    acc.forEach((item: any) => {
      curr.values.forEach((v: any) => {
        let temp = Object.assign({}, item);
        temp.specValues += (v.value || "") + "_";
        temp.specIds += (v.id || "") + "_";
        result.push(temp);
      });
    });
    return result;
  }, []);

  // 如果没有生成任何SKU，则清空列表
  if (skuList.length === 0) {
    state.skuForm.skuList = [];
    return;
  }

  skuList.forEach((item: any) => {
    // 处理specIds
    if (item.specIds && item.specIds.length > 1) {
      // 确保不只是"_"
      item.specIds = item.specIds.substring(0, item.specIds.length - 1);
    } else {
      item.specIds = "";
    }

    // 处理name和specValues
    if (item.specValues && item.specValues.length > 1) {
      // 确保不只是"_"
      item.name = item.specValues
        .substring(0, item.specValues.length - 1)
        .replaceAll("_", " ");
    } else {
      item.name = "";
      item.specValues = "";
    }

    const specIdArr = item.specIds ? item.specIds.split("_") : []; // 使用下划线分隔符

    // 修改SKU匹配逻辑，更好地适应后端数据结构
    let matchedSku = null;
    if (goodsInfo.value.skuList && goodsInfo.value.skuList.length > 0) {
      // 提取前端specIds中的纯ID（去除tid前缀）
      const cleanFrontendIds: string[] = specIdArr.map((id: string) => {
        // 处理临时ID格式，例如 "928_tid_2_1" 或 "tid_1_1_tid_2_1"
        const parts: string[] = id.toString().split("_");
        // 找到不是tid_开头的部分作为真实ID
        const cleanParts: string[] = parts.filter(
          (part: string) => !part.startsWith("tid")
        );
        // 返回最后一个有效ID或者如果全是tid则返回原ID
        return cleanParts.length > 0 ? cleanParts[cleanParts.length - 1] : id;
      });

      for (const sku of goodsInfo.value.skuList) {
        // 获取后端SKU的规格ID数组
        const backendSpecIds: string[] = sku.specIdArr || [];

        // 处理后端specIdArr中的纯ID
        const cleanBackendIds: string[] = backendSpecIds.map((id: string) => {
          // 处理临时ID格式，例如 "928_tid_2_1" 或 "tid_1_1_tid_2_1"
          const parts: string[] = id.toString().split("_");
          // 找到不是tid_开头的部分作为真实ID
          const cleanParts: string[] = parts.filter(
            (part: string) => !part.startsWith("tid")
          );
          // 返回最后一个有效ID或者如果全是tid则返回原ID
          return cleanParts.length > 0 ? cleanParts[cleanParts.length - 1] : id;
        });

        // 检查纯净ID是否匹配（顺序无关）
        const isMatch: boolean =
          cleanFrontendIds.length === cleanBackendIds.length &&
          cleanFrontendIds.every((id: string) =>
            cleanBackendIds.includes(id)
          ) &&
          cleanBackendIds.every((id: string) => cleanFrontendIds.includes(id));

        if (isMatch) {
          matchedSku = sku;
          break;
        }
      }

      // 如果通过规格ID数组无法匹配，尝试使用更宽松的方式匹配
      if (!matchedSku) {
        for (const sku of goodsInfo.value.skuList) {
          // 尝试通过规格名称匹配
          if (sku.name === item.name) {
            matchedSku = sku;
            break;
          }
        }
      }

      // 如果通过规格名称也无法匹配，尝试使用specIds字符串直接匹配
      if (!matchedSku) {
        for (const sku of goodsInfo.value.skuList) {
          if (sku.specIds === item.specIds) {
            matchedSku = sku;
            break;
          }
        }
      }
    }

    // 设置默认值或从匹配的SKU中获取值
    item.id = undefined;
    item.skuSn = "";
    item.price = 0;
    item.stock = 0;

    if (matchedSku) {
      item.id =
        matchedSku.id !== undefined && matchedSku.id !== null
          ? matchedSku.id
          : undefined;
      item.skuSn = matchedSku.skuSn || "";
      // 确保价格是数字类型并正确转换为元为单位显示
      const price = parseFloat(matchedSku.price) || 0;
      item.price = price / 100; // 后端是以分为单位，前端需要转换为元
      item.stock = parseInt(matchedSku.stock) || 0;
    } else {
      // 即使没有匹配到SKU，也要确保价格显示正确（如果item.price已经有值）
      if (item.price) {
        item.price = parseFloat(item.price) || 0;
      }
    }

    // 初始化specValue字段
    for (let i = 1; i <= 3; i++) {
      item[`specValue${i}`] = "";
    }

    // 处理规格值显示字段
    if (item.specValues && item.specValues.length > 1) {
      // 确保不是只有"_"
      const itemSpecValueArr = item.specValues
        .substring(0, item.specValues.length - 1)
        .split("_");
      itemSpecValueArr.forEach((v: any, i: any) => {
        const key = "specValue" + (i + 1);
        item[key] = v || "";
        if (i == 0 && state.specForm.specList.length > 0 && v) {
          const valueIndex = state.specForm.specList[0].values.findIndex(
            (specValue: any) => specValue.value == v
          );
          if (
            valueIndex > -1 &&
            state.specForm.specList[0].values[valueIndex].picUrl
          ) {
            item.picUrl =
              state.specForm.specList[0].values[valueIndex].picUrl || "";
          }
        }
      });
    }
  });

  state.skuForm.skuList = JSON.parse(JSON.stringify(skuList));
}

/**
 * 添加规格
 */
function handleSpecAdd() {
  if (state.specForm.specList.length >= 3) {
    ElMessage.warning("最多支持3组规格");
    return;
  }
  state.specForm.specList.push({ values: [] });
  state.tagInputs.push({ value: undefined, visible: false });
  handleSpecReorder();
}

/**
 * 删除规格
 * @param index
 */
function handleSpecRemove(index: any) {
  state.specForm.specList.splice(index, 1);
  state.tagInputs.splice(index, 1);
  generateSkuList();
  handleSpecReorder();
  handleSpecChange();
}

/**
 * 添加规格值
 *
 * @param specIndex
 */
function handleSpecValueAdd(specIndex: any) {
  // 确保 specIndex 有效
  if (specIndex >= 0 && specIndex < state.tagInputs.length) {
    state.tagInputs[specIndex].visible = true;
  }
}

/**
 *  删除规格值
 *
 * @param rowIndex
 * @param specValueId
 */
function handleSpecValueRemove(rowIndex: any, specValueId: any) {
  // 确保索引有效
  if (rowIndex < 0 || rowIndex >= state.specForm.specList.length) {
    return;
  }

  const specList = JSON.parse(JSON.stringify(state.specForm.specList));
  const removeIndex = specList[rowIndex].values
    .map((item: any) => item.id)
    .indexOf(specValueId);
  if (removeIndex > -1) {
    specList[rowIndex].values.splice(removeIndex, 1);
    state.specForm.specList = specList;
    generateSkuList();
    handleSpecChange();
    handleSpecReorder();
  }
}

/**
 * 规格值输入
 */
function handleSpecValueInput(rowIndex: any) {
  const currSpecValue = state.tagInputs[rowIndex].value;
  const specValues = state.specForm.specList[rowIndex].values;

  // 检查输入是否为空
  if (!currSpecValue) {
    ElMessage.warning("请输入规格值");
    return false;
  }

  if (
    specValues &&
    specValues.length > 0 &&
    specValues.map((item: any) => item.value).includes(currSpecValue)
  ) {
    ElMessage.warning("规格值重复，请重新输入");
    return false;
  }
  if (currSpecValue) {
    if (specValues && specValues.length > 0) {
      // 临时规格值ID tid_1_1
      let maxSpecValueIndex = specValues
        .filter((item: any) => item.id && item.id.includes("tid_"))
        .map((item: any) => (item.id ? item.id.split("_")[2] : 0))
        .reduce((acc: any, curr: any) => {
          return acc > curr ? acc : curr;
        }, 0);
      state.specForm.specList[rowIndex].values[specValues.length] = {
        value: currSpecValue,
        id: "tid_" + (rowIndex + 1) + "_" + ++maxSpecValueIndex,
      };
    } else {
      state.specForm.specList[rowIndex].values = [
        { value: currSpecValue, id: "tid_" + (rowIndex + 1) + "_1" },
      ];
    }
  }
  state.tagInputs[rowIndex].value = undefined;
  state.tagInputs[rowIndex].visible = false;
  generateSkuList();
}

/**
 * 合并规格单元格
 *
 * @param cellObj 单元格对象
 */

const objectSpanMethod = ({ rowIndex, columnIndex }: any) => {
  let mergeRows = [1, 1, 1]; // 分别对应规格1、规格2、规格3列合并的行数
  const specLen = state.specForm.specList.filter(
    (item) => item.values && item.values.length > 0
  ).length;
  if (specLen == 2) {
    const values_len_2 = state.specForm.specList[1].values
      ? state.specForm.specList[1].values.length
      : 1; // 第2个规格项的规格值的数量
    mergeRows = [values_len_2, 1, 1];
  } else if (specLen == 3) {
    const values_len_2 = state.specForm.specList[1].values
      ? state.specForm.specList[1].values.length
      : 1; // 第2个规格项的规格值的数量
    const values_len_3 = state.specForm.specList[2].values
      ? state.specForm.specList[2].values.length
      : 1; // 第3个规格项的规格值的数量
    mergeRows = [values_len_2 * values_len_3, values_len_3, 1];
  }
  if (columnIndex == 0) {
    if (rowIndex % mergeRows[0] === 0) {
      return [mergeRows[0], 1]; // 合并单元格
    } else {
      return [0, 0]; // 隐藏单元格
    }
  }
  if (columnIndex == 1) {
    if (rowIndex % mergeRows[1] === 0) {
      return [mergeRows[1], 1]; // 合并单元格
    } else {
      return [0, 0]; // 隐藏单元格
    }
  }
};

/**
 * 商品表单提交
 */
function submitForm() {
  // 判断商品SKU列表是否为空
  if (!state.skuForm.skuList || state.skuForm.skuList.length === 0) {
    ElMessage.warning("未添加商品库存");
    return false;
  }
  specFormRef.value.validate((specValid: any) => {
    if (specValid) {
      skuFormRef.value.validate((skuValid: any) => {
        if (skuValid) {
          // 重组商品的规格和SKU列表
          let submitsData = Object.assign({}, goodsInfo.value);
          delete submitsData.specList;
          delete submitsData.skuList;

          let specList = [] as any[];
          state.specForm.specList.forEach((item) => {
            item.values.forEach((value: any) => {
              value.name = item.name;
            });
            specList = specList.concat(item.values);
          });
          submitsData.specList = specList; // 规格列表

          submitsData.price *= 100; // 金额转成分保存至数据库
          submitsData.originPrice *= 100;

          let skuList = JSON.parse(JSON.stringify(state.skuForm.skuList));
          skuList.map((item: any) => {
            // 确保价格是数字类型后再进行转换
            const price = parseFloat(item.price) || 0;
            item.price = Math.round(price * 100); // 转换为分为单位
            return item;
          });
          submitsData.skuList = skuList;
          const goodsId = goodsInfo.value.id;
          if (goodsId) {
            // 编辑商品提交
            updateSpu(goodsId, submitsData).then(() => {
              router.push({ path: "/pms/goods" });
              ElNotification({
                title: "提示",
                message: "编辑商品成功",
                type: "success",
              });
            });
          } else {
            // 新增商品提交
            addSpu(submitsData).then(() => {
              router.push({ path: "/pms/goods" });
              ElNotification({
                title: "提示",
                message: "新增商品成功",
                type: "success",
              });
            });
          }
        }
      });
    }
  });
}

function handlePrev() {
  emit("prev");
}

onMounted(() => {
  // 由于使用了watch的immediate选项，这里不需要再调用loadData()
});
</script>

<style lang="scss" scoped>
.component-container {
  &__main {
    margin: 20px auto;
  }

  &__footer {
    position: fixed;
    right: 20px;
    bottom: 20px;
  }

  .box-card {
    margin-bottom: 20px;
  }
}

.el-form--inline .el-form-item {
  margin-top: 18px;
}
</style>
