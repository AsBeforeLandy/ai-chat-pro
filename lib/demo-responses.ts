/**
 * Demo response generator — runs entirely client-side.
 *
 * Keyword-matching routes to curated Markdown content.
 * Used when no real API key is configured.
 */

export function generateDemoResponse(query: string): string {
  const q = query.toLowerCase();

  if (
    q.includes("快速排序") ||
    q.includes("quicksort") ||
    q.includes("排序")
  ) {
    return QUICKSORT_RESPONSE;
  }

  if (q.includes("机器学习") || q.includes("machine learning")) {
    return MACHINE_LEARNING_RESPONSE;
  }

  if (q.includes("翻译") || q.includes("translate")) {
    return TRANSLATION_RESPONSE;
  }

  if (q.includes("项目计划") || q.includes("大纲")) {
    return PROJECT_PLAN_RESPONSE;
  }

  // Default fallback
  return buildDefaultResponse(query);
}

// ==================== Response Templates ====================

const QUICKSORT_RESPONSE = `好的！下面是用 Python 实现的**快速排序算法**：

\`\`\`python
def quicksort(arr):
    """快速排序 — 分治法实现"""
    if len(arr) <= 1:
        return arr

    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]

    return quicksort(left) + middle + quicksort(right)


# 测试
if __name__ == "__main__":
    test_arr = [3, 6, 8, 10, 1, 2, 1]
    print(f"排序前: {test_arr}")
    print(f"排序后: {quicksort(test_arr)}")
\`\`\`

**算法分析：**

- **时间复杂度**：平均 \`O(n log n)\`，最坏 \`O(n²)\`
- **空间复杂度**：\`O(log n)\`（递归栈深度）
- **核心思想**：分治法 — 选取基准值(pivot)，将数组划分为小于、等于、大于三部分，递归排序

> 💡 提示：上面的实现使用了列表推导式创建新数组，简洁但消耗额外空间。生产环境可使用**原地分区**来优化内存。`;

const MACHINE_LEARNING_RESPONSE = `**机器学习（Machine Learning）** 是人工智能的重要分支，让计算机从数据中自动学习规律。

## 三大学习范式

| 类型 | 特点 | 典型应用 |
|------|------|----------|
| **监督学习** | 使用带标签数据训练 | 图像分类、房价预测、情感分析 |
| **无监督学习** | 无标签数据中找模式 | 客户分群、异常检测、降维 |
| **强化学习** | 通过奖惩信号学习策略 | 游戏AI、机器人控制、推荐系统 |

## 典型工作流程

1. **数据准备** → 收集、清洗、标注
2. **特征工程** → 选择/构造有意义特征
3. **模型选择** → 根据任务选算法（决策树、神经网络等）
4. **训练验证** → 划分训练集/验证集，交叉验证
5. **评估调优** → 超参数调优、防止过拟合
6. **部署监控** → 模型上线、持续监控漂移

## 需要警惕的问题

- **过拟合**：训练集表现好但泛化差 → 正则化、早停
- **欠拟合**：未能捕获数据模式 → 增加模型复杂度
- **数据偏差**：训练数据不代表真实分布 → 数据增强、重采样

有什么具体方向想深入探讨吗？`;

const TRANSLATION_RESPONSE = `根据你的翻译需求，以下是翻译结果：

---

**中文 → English:**
- 你好，今天过得怎么样？ → *Hello, how is your day going?*
- 这是一个 AI 对话前端项目 → *This is an AI chat frontend project*

**English → 中文:**
- Machine learning is transforming industries → *机器学习正在变革各行各业*
- The quick brown fox jumps over the lazy dog → *敏捷的棕色狐狸跳过了懒狗*

---

如果你有更多文本需要翻译，请告诉我源语言和目标语言 😊`;

const PROJECT_PLAN_RESPONSE = `以下是一份**项目计划书**的标准大纲：

## 一、项目概述
- 项目名称与背景
- 核心目标（SMART原则）
- 项目范围与交付物

## 二、团队与职责
| 角色 | 职责 |
|------|------|
| 项目经理 | 整体协调、进度把控 |
| 技术负责人 | 技术选型、架构决策 |
| 开发工程师 | 功能实现、代码Review |
| 测试工程师 | 质量保障、自动化测试 |

## 三、里程碑计划

| 阶段 | 时间 | 交付物 |
|------|------|--------|
| 需求分析 | Week 1-2 | PRD文档 |
| 设计阶段 | Week 3-4 | 设计稿、技术方案 |
| 开发Phase1 | Week 5-8 | MVP版本 |
| 开发Phase2 | Week 9-11 | 完整功能 |
| 测试优化 | Week 12-13 | 测试报告 |
| 上线部署 | Week 14 | 生产版本 |

## 四、风险管理
- 识别潜在风险（技术/资源/进度）
- 制定应对方案
- 建立监控与预警机制

需要我针对某个部分展开详细说明吗？`;

function buildDefaultResponse(query: string): string {
  const snippet =
    query.length > 40 ? query.substring(0, 40) + "..." : query;

  return `关于 **"${snippet}"**，这是一个很好的问题！

让我从几个核心角度来分析：

## 🔍 关键分析

1. **问题背景** — 需要结合具体的上下文来理解核心诉求
2. **解决方案** — 基于最佳实践，这里有几个可行的方向：
   - 从基础概念入手，建立清晰的知识框架
   - 参考已有的成功案例和模式
   - 通过小规模实验验证假设

## 💡 建议思路

可以采用**分步迭代**的策略：
- 先理清需求本质
- 设计最小可行方案
- 快速验证并收集反馈
- 根据反馈持续优化

---

> 如果可以补充更多细节或具体场景，我可以给出更精准的针对性建议！`;
}
